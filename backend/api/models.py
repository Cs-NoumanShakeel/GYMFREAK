from django.db import models

from django.contrib.auth.models import User

from django.utils import timezone

class Tutorial(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    video = models.FileField(upload_to='tutorial_videos/')
    exercise_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.title






class Session(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    video = models.FileField(upload_to='tutorial_videos/')
    exercise_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.title

class History(models.Model):
     user = models.ForeignKey(User, on_delete=models.CASCADE)
     session = models.ForeignKey(Session, on_delete=models.CASCADE) 
     accuracy_score = models.FloatField(help_text="Percentage accuracy of movements", null=True, blank=True, default=0)
     weight = models.FloatField(help_text='Weight of the user')
     created_at = models.DateTimeField(default=timezone.now)


class UserSessionResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    accuracy_score = models.FloatField(help_text="Percentage accuracy of movements")
    uploaded_video = models.FileField(upload_to='tutorial_videos/')
    created_at = models.DateTimeField(auto_now_add=True)
    calories = models.FloatField(help_text='calories burned of the user', blank=True,null=True)
    duration = models.FloatField(help_text='Duration of exercises in minutes',blank=True,null=True)

    def __str__(self):
        return f"{self.user.username} - {self.session.title} - {self.created_at.strftime('%Y-%m-%d')}"



