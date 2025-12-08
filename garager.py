# import boto3
# import os
# from dotenv import load_dotenv

# # Load variables from .env file
# load_dotenv()

# # --- Configuration ---
# GARAGE_ENDPOINT = 'http://72.61.231.140:3900'  # Replace with os.getenv("S3_ENDPOINT") when being run through cloud
# ACCESS_KEY = os.getenv("GARAGE_ACCESS_KEY")
# SECRET_KEY = os.getenv("GARAGE_SECRET_KEY")
# BUCKET_NAME = "images"
# # ----------------------

# def upload_single_file_to_garage(file_path, bucket_name, s3_key):
#     """
#     Uploads exactly one file to your Garage S3 bucket.
#     """
#     if not os.path.exists(file_path):
#         print(f"❌ Error: File not found -> {file_path}")
#         return

#     print(f"Connecting to Garage S3 API at: {GARAGE_ENDPOINT}")

#     # Initialize S3 client
#     s3_client = boto3.client(
#         "s3",
#         endpoint_url=GARAGE_ENDPOINT,
#         aws_access_key_id=ACCESS_KEY,
#         aws_secret_access_key=SECRET_KEY,
#     )

#     print(f"Uploading {file_path} -> s3://{bucket_name}/{s3_key}")

#     try:
#         s3_client.upload_file(file_path, bucket_name, s3_key)
#         print("✅ Upload complete!")
#     except Exception as e:
#         print(f"❌ Upload failed: {e}")


# if __name__ == "__main__":
#     # Example usage:
#     file_path = r"D:\SIH\imagedata\downloaded_images\pampus_chinensis_fix_3.jpg"  # change this to your image path
#     s3_key = "pampus_chinensis_fix_3.jpg"  # name inside the bucket

#     upload_single_file_to_garage(file_path, BUCKET_NAME, s3_key)

import os
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# --- Configuration ---
# NOTE: Using environment variables for connection details
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://72.61.231.140:3900")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "GK1b8c49df67d5f049f5b6754f")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "c7d75e592b65b736bb7fc065d39178ab835fc6e7ce40559bf08e897c1c4c3cc0")
BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "images")

# Define the target "folder" prefix
TARGET_PREFIX = "images/"
# ----------------------

def connect_s3():
    """Initializes and returns the boto3 S3 client."""
    print(f"Connecting to S3-compatible service at: {S3_ENDPOINT}...")
    try:
        s3 = boto3.client(
            's3',
            endpoint_url=S3_ENDPOINT,
            aws_access_key_id=S3_ACCESS_KEY,
            aws_secret_access_key=S3_SECRET_KEY
        )
        # Check connection
        s3.list_objects_v2(Bucket=BUCKET_NAME, MaxKeys=1)
        print(f"✅ S3 Connection established for bucket: {BUCKET_NAME}")
        return s3
    except (ClientError, NoCredentialsError) as e:
        print(f"❌ S3 Connection failed: {e}")
        return None
    except Exception as e:
        print(f"❌ S3 General Error: {e}")
        return None

def perform_move(s3_client, original_key, new_key):
    """
    Performs the Copy-then-Delete operation for a single object key.
    Returns True on success, False on failure.
    """
    try:
        # 1. Define the source for the copy operation
        copy_source = {'Bucket': BUCKET_NAME, 'Key': original_key}
        
        # 2. Copy the object to the new key
        s3_client.copy_object(
            Bucket=BUCKET_NAME,
            Key=new_key,
            CopySource=copy_source
        )
        
        # 3. Delete the original object
        s3_client.delete_object(
            Bucket=BUCKET_NAME,
            Key=original_key
        )
        return True
    except ClientError as e:
        print(f"   ❌ Failed to move {original_key}: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected error for {original_key}: {e}")
        return False

def move_objects_to_prefix(s3_client):
    """
    Iterates through all objects, moves them to TARGET_PREFIX, 
    and retries any failures once.
    """
    paginator = s3_client.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=BUCKET_NAME)
    
    # List to hold keys that failed the initial attempt
    failed_moves = []
    
    total_moved = 0
    total_skipped = 0
    
    print(f"\n--- Starting Initial Object Move to '{TARGET_PREFIX}' ---")

    # --- PHASE 1: Initial Move Attempt ---
    for page in pages:
        if 'Contents' not in page:
            continue

        for obj in page['Contents']:
            original_key = obj['Key']
            
            # Skip objects that are already in the target prefix
            if original_key.startswith(TARGET_PREFIX):
                total_skipped += 1
                continue
            
            new_key = TARGET_PREFIX + original_key
            
            print(f"Attempt 1: Moving {original_key} -> {new_key}")

            if perform_move(s3_client, original_key, new_key):
                total_moved += 1
            else:
                # Add the failed key to the list for later retry
                failed_moves.append(original_key)
                
    
    # --- PHASE 2: Retry Failed Moves ---
    if failed_moves:
        print("\n--- Starting Retry Phase ---")
        print(f"⚠️ **{len(failed_moves)}** object(s) failed initial move. Retrying...")
        
        final_failures = []
        retries_successful = 0
        
        for original_key in failed_moves:
            new_key = TARGET_PREFIX + original_key
            
            print(f"Attempt 2: Retrying {original_key} -> {new_key}")
            
            if perform_move(s3_client, original_key, new_key):
                retries_successful += 1
                total_moved += 1 # Count as successfully moved
            else:
                final_failures.append(original_key)

    # --- Final Summary ---
    print("\n--- Process Complete ---")
    print(f"Total objects moved: **{total_moved}** ➡️")
    print(f"Total objects skipped (already prefixed): **{total_skipped}**")
    if failed_moves:
        print(f"Total retries successful: **{retries_successful}** ✅")
    
    if final_failures:
        print(f"\n❌ **{len(final_failures)}** object(s) FAILED after final retry:")
        for key in final_failures:
            print(f" - {key}")
        print("\nPlease investigate these keys manually.")
    elif failed_moves:
        print("🎉 All objects were moved successfully after the retry!")

def main():
    s3_client = connect_s3()
    if s3_client:
        move_objects_to_prefix(s3_client)

if __name__ == "__main__":
    main()