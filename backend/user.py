import os
import django

# Set the correct Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")  # adjust if your settings module path is different
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = "real"
email = "admin@example.com"
password = "12345"

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print("Superuser created ✅")
else:
    print("Superuser already exists ⚡")
