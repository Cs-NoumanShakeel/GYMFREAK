import os
import cloudinary
import cloudinary.uploader

# Cloudinary config
cloudinary.config(
    cloud_name="dw9dtsgdm",
    api_key="856532649387765",
    api_secret="x7xZ_FjJd1Drf29zlZIfut3JY_w"
)

# Get the absolute path to the video file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # folder where test.py is
video_path = os.path.join(BASE_DIR, "sample.mp4")

# Upload
response = cloudinary.uploader.upload_large(
    video_path,
    resource_type="video"
)

print("✅ Upload successful!")
print(response["secure_url"])
