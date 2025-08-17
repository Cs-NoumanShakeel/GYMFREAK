from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Session,UserSessionResult,History

from .models import Tutorial
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    

class TutorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutorial
        fields = '__all__'


class SessionSerializer(serializers.ModelSerializer):
   video_url = serializers.SerializerMethodField()

   class Meta:
       model = Session
       fields = ['id', 'title', 'description', 'video_url', 'exercise_link']

   def get_video_url(self, obj):
       if obj.video:
           return f"https://gymfreak-h9ck.onrender.com{obj.video.url}"
       return None


class UserSessionResultSerializer(serializers.ModelSerializer):
    session_title = serializers.CharField(source='session.title', read_only=True)

    class Meta:
        model = UserSessionResult
        fields = [
            'id',
            'user',
            'session',        # will be the FK id
            'session_title',  # human-friendly title
            'accuracy_score',
            'uploaded_video',
            'created_at',
            'calories',
            'duration',
        ]
        read_only_fields = ['id', 'user', 'created_at']


class HistorySerializer(serializers.ModelSerializer):
    session_title = serializers.CharField(source='session.title', read_only=True)
    session_description = serializers.CharField(source='session.description', read_only=True)
    session_video = serializers.FileField(source='session.video', read_only=True)

    accuracy_score = serializers.FloatField()  
    weight = serializers.FloatField()

    class Meta:
        model = History
        fields = [
            'id',
            'user',
            'session',
            'session_title',
            'session_description',
            'session_video',
            'accuracy_score',
            'weight',
            'created_at'
        ]
