import os
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Configure Cloudinary
cloudinary.config(
    cloud_name='dw9dtsgdm',
    api_key='856532649387765',
    api_secret='x7xZ_FjJd1Drf29zlZIfut3JY_w'
)

# Get the script directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Path to the video relative to the script
video_path = os.path.join(BASE_DIR, "sample.mp4")

# Upload video
response = cloudinary.uploader.upload_large(
    video_path,
    resource_type="video"
)

print("Uploaded video URL:", response['secure_url'])
