import boto3
import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# --- Configuration ---
GARAGE_ENDPOINT = os.getenv("S3_ENDPOINT")
SECRET_KEY = os.getenv("GARAGE_SECRET_KEY")
ACCESS_KEY = os.getenv("GARAGE_ACCESS_KEY")
BUCKET_NAME = "hat"
IMAGE_SOURCE_DIR = "downloaded_images"
S3_PREFIX = "images/" # The "folder" prefix you want inside the bucket
# ----------------------

def upload_file(s3_client, file_path, bucket_name, s3_key):
    """
    Attempts to upload a single file using the provided S3 client.
    Returns True on success, False on failure.
    """
    try:
        s3_client.upload_file(file_path, bucket_name, s3_key)
        print(f"   ✅ Uploaded: s3://{bucket_name}/{s3_key}")
        return True
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return False

def process_image_uploads():
    """
    Iterates through all files in the source directory, uploads them to 
    the S3 bucket with the 'images/' prefix, and tracks failures.
    """
    if not os.path.isdir(IMAGE_SOURCE_DIR):
        print(f"❌ ERROR: Image directory not found at: {IMAGE_SOURCE_DIR}")
        return

    # Check for mandatory S3 credentials
    if not all([GARAGE_ENDPOINT, ACCESS_KEY, SECRET_KEY]):
        print("❌ ERROR: Missing one or more S3 configuration variables (S3_ENDPOINT, GARAGE_ACCESS_KEY, GARAGE_SECRET_KEY).")
        return

    print(f"Connecting to Garage S3 API at: {GARAGE_ENDPOINT}")
    
    # Initialize S3 client
    s3_client = boto3.client(
        "s3",
        endpoint_url=GARAGE_ENDPOINT,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
    )

    failed_uploads = []
    total_files = 0

    print(f"--- Starting Upload to s3://{BUCKET_NAME}/{S3_PREFIX} ---")

    for filename in os.listdir(IMAGE_SOURCE_DIR):
        total_files += 1
        
        # 1. Construct the full local file path
        file_path = os.path.join(IMAGE_SOURCE_DIR, filename)

        # 2. Skip directories and ensure it's a file
        if not os.path.isfile(file_path):
            print(f"   ⏩ Skipping directory/other item: {filename}")
            continue
            
        # 3. Define the S3 key with the required prefix
        s3_key = S3_PREFIX + filename # e.g., images/kjdfnwkf.jpg

        print(f"Processing local file: {file_path}")

        # 4. Attempt the upload
        if not upload_file(s3_client, file_path, BUCKET_NAME, s3_key):
            failed_uploads.append(file_path)

    # --- Final Summary ---
    print("\n--- Upload Process Complete ---")
    print(f"Total files processed: {total_files}")
    
    successful_uploads = total_files - len(failed_uploads)
    print(f"Successful uploads: **{successful_uploads}** ✅")

    if failed_uploads:
        print(f"\n❌ **{len(failed_uploads)}** Upload(s) FAILED:")
        for fail_path in failed_uploads:
            print(f" - {fail_path}")
        print("\nPlease check network connection, permissions, and file integrity.")
    else:
        print("🎉 **All files uploaded successfully!**")

if __name__ == "__main__":
    process_image_uploads()


# import os
# import boto3
# from botocore.exceptions import ClientError, NoCredentialsError

# # --- Configuration ---
# # NOTE: Using environment variables for connection details
# S3_ENDPOINT = os.getenv("S3_ENDPOINT")
# S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY")
# S3_SECRET_KEY = os.getenv("S3_SECRET_KEY")
# BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# # Define the target "folder" prefix
# TARGET_PREFIX = "images/"
# # ----------------------

# def connect_s3():
#     """Initializes and returns the boto3 S3 client."""
#     print(f"Connecting to S3-compatible service at: {S3_ENDPOINT}...")
#     try:
#         s3 = boto3.client(
#             's3',
#             endpoint_url=S3_ENDPOINT,
#             aws_access_key_id=S3_ACCESS_KEY,
#             aws_secret_access_key=S3_SECRET_KEY
#         )
#         # Check connection
#         s3.list_objects_v2(Bucket=BUCKET_NAME, MaxKeys=1)
#         print(f"✅ S3 Connection established for bucket: {BUCKET_NAME}")
#         return s3
#     except (ClientError, NoCredentialsError) as e:
#         print(f"❌ S3 Connection failed: {e}")
#         return None
#     except Exception as e:
#         print(f"❌ S3 General Error: {e}")
#         return None

# def perform_move(s3_client, original_key, new_key):
#     """
#     Performs the Copy-then-Delete operation for a single object key.
#     Returns True on success, False on failure.
#     """
#     try:
#         # 1. Define the source for the copy operation
#         copy_source = {'Bucket': BUCKET_NAME, 'Key': original_key}
        
#         # 2. Copy the object to the new key
#         s3_client.copy_object(
#             Bucket=BUCKET_NAME,
#             Key=new_key,
#             CopySource=copy_source
#         )
        
#         # 3. Delete the original object
#         s3_client.delete_object(
#             Bucket=BUCKET_NAME,
#             Key=original_key
#         )
#         return True
#     except ClientError as e:
#         print(f"   ❌ Failed to move {original_key}: {e}")
#         return False
#     except Exception as e:
#         print(f"   ❌ Unexpected error for {original_key}: {e}")
#         return False

# def move_objects_to_prefix(s3_client):
#     """
#     Iterates through all objects, moves them to TARGET_PREFIX, 
#     and retries any failures once.
#     """
#     paginator = s3_client.get_paginator('list_objects_v2')
#     pages = paginator.paginate(Bucket=BUCKET_NAME)
    
#     # List to hold keys that failed the initial attempt
#     failed_moves = []
    
#     total_moved = 0
#     total_skipped = 0
    
#     print(f"\n--- Starting Initial Object Move to '{TARGET_PREFIX}' ---")

#     # --- PHASE 1: Initial Move Attempt ---
#     for page in pages:
#         if 'Contents' not in page:
#             continue

#         for obj in page['Contents']:
#             original_key = obj['Key']
            
#             # Skip objects that are already in the target prefix
#             if original_key.startswith(TARGET_PREFIX):
#                 total_skipped += 1
#                 continue
            
#             new_key = TARGET_PREFIX + original_key
            
#             print(f"Attempt 1: Moving {original_key} -> {new_key}")

#             if perform_move(s3_client, original_key, new_key):
#                 total_moved += 1
#             else:
#                 # Add the failed key to the list for later retry
#                 failed_moves.append(original_key)
                
    
#     # --- PHASE 2: Retry Failed Moves ---
#     if failed_moves:
#         print("\n--- Starting Retry Phase ---")
#         print(f"⚠️ **{len(failed_moves)}** object(s) failed initial move. Retrying...")
        
#         final_failures = []
#         retries_successful = 0
        
#         for original_key in failed_moves:
#             new_key = TARGET_PREFIX + original_key
            
#             print(f"Attempt 2: Retrying {original_key} -> {new_key}")
            
#             if perform_move(s3_client, original_key, new_key):
#                 retries_successful += 1
#                 total_moved += 1 # Count as successfully moved
#             else:
#                 final_failures.append(original_key)

#     # --- Final Summary ---
#     print("\n--- Process Complete ---")
#     print(f"Total objects moved: **{total_moved}** ➡️")
#     print(f"Total objects skipped (already prefixed): **{total_skipped}**")
#     if failed_moves:
#         print(f"Total retries successful: **{retries_successful}** ✅")
    
#     if final_failures:
#         print(f"\n❌ **{len(final_failures)}** object(s) FAILED after final retry:")
#         for key in final_failures:
#             print(f" - {key}")
#         print("\nPlease investigate these keys manually.")
#     elif failed_moves:
#         print("🎉 All objects were moved successfully after the retry!")

# def main():
#     s3_client = connect_s3()
#     if s3_client:
#         move_objects_to_prefix(s3_client)

# if __name__ == "__main__":
#     main()