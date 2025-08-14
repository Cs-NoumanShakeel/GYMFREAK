import os
import shutil

# Paths
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
BASE_DIR = os.path.join(ROOT_DIR, "processed_data")

def organize_npy_files():
    for exercise_name in os.listdir(BASE_DIR):
        exercise_path = os.path.join(BASE_DIR, exercise_name)
        if not os.path.isdir(exercise_path):
            continue

        # Target npy folder inside each exercise folder
        npy_folder_name = f"{exercise_name}_npy"
        npy_folder_path = os.path.join(exercise_path, npy_folder_name)
        os.makedirs(npy_folder_path, exist_ok=True)

        # Move .npy files to npy folder
        for filename in os.listdir(exercise_path):
            if filename.endswith(".npy"):
                src_path = os.path.join(exercise_path, filename)
                dest_path = os.path.join(npy_folder_path, filename)
                print(f"Moving {src_path} -> {dest_path}")
                shutil.move(src_path, dest_path)

if __name__ == "__main__":
    organize_npy_files()
    print("✅ Finished organizing .npy files.")
