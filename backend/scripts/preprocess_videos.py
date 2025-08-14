# scripts/preprocess_videos.py

import os
import cv2
import numpy as np
import mediapipe as mp

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
DATASET_DIR = os.path.join(BASE_DIR, "datasets", "workout")
OUTPUT_DIR = os.path.join(BASE_DIR, "processed_data")

# Create output folder if not exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Mediapipe Pose setup
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

def extract_keypoints_from_video(video_path):
    """
    Extracts pose keypoints from a video and returns a numpy array of shape:
    (frames, 33, 4) where each keypoint is (x, y, z, visibility)
    """
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
                # If no landmarks detected in a frame, append zeros
                keypoints_all_frames.append(np.zeros((33, 4)))

    cap.release()
    return np.array(keypoints_all_frames)


def process_dataset():
    """
    Loops through dataset folder, extracts keypoints for each video,
    and saves them to processed_data maintaining folder structure.
    """
    for exercise_name in os.listdir(DATASET_DIR):
        exercise_path = os.path.join(DATASET_DIR, exercise_name)
        if not os.path.isdir(exercise_path):
            continue

        output_exercise_path = os.path.join(OUTPUT_DIR, exercise_name)
        os.makedirs(output_exercise_path, exist_ok=True)

        for video_file in os.listdir(exercise_path):
            if not video_file.lower().endswith((".mp4", ".avi", ".mov")):
                continue

            video_path = os.path.join(exercise_path, video_file)
            print(f"Processing: {video_path}")

            keypoints = extract_keypoints_from_video(video_path)

            # Save .npy
            npy_filename = os.path.splitext(video_file)[0] + ".npy"
            np.save(os.path.join(output_exercise_path, npy_filename), keypoints)

            # Save .csv for inspection
            csv_filename = os.path.splitext(video_file)[0] + ".csv"
            flat_keypoints = keypoints.reshape(keypoints.shape[0], -1)  # flatten to (frames, 33*4)
            np.savetxt(os.path.join(output_exercise_path, csv_filename), flat_keypoints, delimiter=",")

            print(f"Saved keypoints: {npy_filename} and {csv_filename}")

if __name__ == "__main__":
    process_dataset()
    print("✅ Dataset preprocessing complete.")
