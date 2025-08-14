from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView
from rest_framework.generics import RetrieveUpdateAPIView

import tempfile
import numpy as np
import cv2
import mediapipe as mp
import os

from .models import Tutorial, Session, UserSessionResult, History
from .serializer import UserSerializer, TutorialSerializer, SessionSerializer, UserSessionResultSerializer, HistorySerializer

mp_pose = mp.solutions.pose

class UserCreateView(generics.CreateAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation Errors:", serializer.errors)
            return Response(serializer.errors, status=400)
        self.perform_create(serializer)
        return Response(serializer.data, status=201)

class TutorialList(APIView):
    def get(self, request):
        tutorials = Tutorial.objects.all()
        serializer = TutorialSerializer(tutorials, many=True)
        return Response(serializer.data)

class SessionList(APIView):
    def get(self, request):
        sessions = Session.objects.all()
        serializer = SessionSerializer(sessions, many=True)
        return Response(serializer.data)

from fastdtw import fastdtw
from scipy.spatial.distance import euclidean

def dtw_distance(seq1, seq2):
    seq1_flat = seq1.reshape(seq1.shape[0], -1)
    seq2_flat = seq2.reshape(seq2.shape[0], -1)
    distance, path = fastdtw(seq1_flat, seq2_flat, dist=euclidean)
    return distance

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def process_video(request):
    uploaded_file = request.FILES.get('uploaded_video')
    session_id = request.data.get('session')
    session_name = request.data.get('title')
    weight = float(request.data.get('weight', 0))  # make sure it's float
    
    if not uploaded_file or not session_id or not session_name:
        return Response({"error": "Missing video file, session id, or title"}, status=400)

    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=401)

    session_obj = get_object_or_404(Session, id=session_id)

    with tempfile.NamedTemporaryFile(delete=True, suffix=".mp4") as temp_video:
        for chunk in uploaded_file.chunks():
            temp_video.write(chunk)
        temp_video.flush()
        user_keypoints = extract_keypoints_from_video(temp_video.name)
        
        # Get video duration in minutes
        cap = cv2.VideoCapture(temp_video.name)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        duration_seconds = frame_count / fps
        cap.release()

        duration_minutes = round(duration_seconds / 60, 2)

    ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BASE_DIR = os.path.join(ROOT_DIR, "Workout_npy")

    def normalize_name(name):
        return name.lower().replace(' ', '_')

    def strip_suffix(name, suffix="_npy"):
        if name.lower().endswith(suffix):
            return name[:-len(suffix)]
        return name

    normalized_session = normalize_name(session_name)

    folder_to_use = None
    for foldername in os.listdir(BASE_DIR):
        folder_base = strip_suffix(foldername)
        if normalized_session == folder_base.lower():
            folder_to_use = os.path.join(BASE_DIR, foldername)
            break

    if not folder_to_use:
        return Response({"error": "No matching dataset found"}, status=404)

    distances = []
    for npy_file in os.listdir(folder_to_use):
        if not npy_file.endswith(".npy"):
            continue
        dataset_keypoints = np.load(os.path.join(folder_to_use, npy_file))
        dist = dtw_distance(user_keypoints, dataset_keypoints)
        distances.append(dist)

    if not distances:
        return Response({"error": "No .npy files found in dataset folder"}, status=404)

    best_dist = min(distances)
    avg_dist = sum(distances) / len(distances)
    max_dist = max(distances) if distances else 1
    best_accuracy = max(0, 100 * (1 - best_dist / max_dist))
    avg_accuracy = max(0, 100 * (1 - avg_dist / max_dist))
    raw_accuracy = best_accuracy if best_accuracy > avg_accuracy else avg_accuracy
    
    # Round to 1 decimal place for consistency
    accuracy_score = round(raw_accuracy, 1)

    # MET values
    MET_VALUES = {
        "pushup": 4.0,
        "pullup": 8.0,
        "russian_twist": 4.0,
        "leg_raise": 3.5,
        "deadlift": 6.0,
        "bench_press": 6.0,
        "tricep_pushdown": 3.5,
        "lateral_raise": 3.5,
        "squat": 5.0
    }

    met_value = MET_VALUES.get(normalized_session, 4.0)  # default 4.0 if not found
    calories = round(met_value * float(weight) * duration_minutes * 0.0175, 2)

    # Save result in DB
    user_session_result = UserSessionResult.objects.create(
        user=request.user,
        session=session_obj,
        accuracy_score=accuracy_score,
        uploaded_video=uploaded_file,
        calories=calories,
        duration=duration_minutes,
    )

    return Response({
        "accuracy_score": accuracy_score,
        "calories_burned": calories,
        "result_id": user_session_result.id
    })

def extract_keypoints_from_video(video_path):
    cap = cv2.VideoCapture(video_path)
    keypoints_all_frames = []

    with mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(frame_rgb)

            if results.pose_landmarks:
                frame_keypoints = []
                for lm in results.pose_landmarks.landmark:
                    frame_keypoints.append([lm.x, lm.y, lm.z, lm.visibility])
                keypoints_all_frames.append(frame_keypoints)
            else:
                keypoints_all_frames.append(np.zeros((33, 4)))

    cap.release()
    return np.array(keypoints_all_frames)

class UserSessionResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        results = (
            UserSessionResult.objects
            .filter(user=request.user)
            .select_related("session")  # avoids extra DB hits
        )
        serializer = UserSessionResultSerializer(results, many=True)
        return Response(serializer.data)

class SessionDetail(RetrieveAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [AllowAny] 

class SessionUpdateDetail(RetrieveUpdateAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [AllowAny]

class HistoryList(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        history = History.objects.filter(user=request.user)
        serializer = HistorySerializer(history, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id
        session_id = data.get('session')
        
        # Round accuracy_score to 1 decimal place if provided
        if 'accuracy_score' in data:
            data['accuracy_score'] = round(float(data['accuracy_score']), 1)
        
        # Check if history already exists for this user and session
        existing_history = History.objects.filter(
            user=request.user, 
            session=session_id
        ).first()
        
        if existing_history:
            # Update existing history
            serializer = HistorySerializer(existing_history, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    **serializer.data,
                    "message": "History updated successfully"
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Create new history
            serializer = HistorySerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    **serializer.data,
                    "message": "History created successfully"
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HistoryDetail(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        try:
            return History.objects.get(pk=pk, user=user)
        except History.DoesNotExist:
            return None
    
    def get(self, request, pk):
        history = self.get_object(pk, request.user)
        if not history:
            return Response({"error": "History not found"}, status=404)
        serializer = HistorySerializer(history)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        history = self.get_object(pk, request.user)
        if not history:
            return Response({"error": "History not found"}, status=404)
        
        # Round accuracy_score to 1 decimal place if provided
        data = request.data.copy()
        if 'accuracy_score' in data:
            data['accuracy_score'] = round(float(data['accuracy_score']), 1)
        
        # Update the history with new data
        serializer = HistorySerializer(history, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                **serializer.data,
                "message": "History updated successfully"
            }, status=200)
        return Response(serializer.errors, status=400)
    
    def delete(self, request, pk):
        history = self.get_object(pk, request.user)
        if not history:
            return Response({"error": "History not found"}, status=404)
        
        history.delete()
        return Response({"message": "History deleted successfully"}, status=204)