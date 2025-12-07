import boto3
import os

# --- Configuration (UPDATE THESE VALUES) ---
# Replace with the actual keys and endpoint
GARAGE_ENDPOINT = 'http://72.61.231.140:3900'
ACCESS_KEY = ...
SECRET_KEY = ...
BUCKET_NAME = ...

# Local folder to upload. 
# './Main/' means a folder named 'Main' located in the same directory as this script.
LOCAL_DIRECTORY_PATH = './downloaded_images/'

# Optional: Prefix inside the S3 bucket (acts as a folder).
S3_UPLOAD_PREFIX = 'fish-images/'
# -------------------------------------------

def upload_directory_to_garage(local_path, bucket_name, prefix):
    """
    Connects to the Garage S3 endpoint and uploads all files 
    from the local directory recursively.
    """
    if not os.path.exists(local_path):
        print(f"Error: Local directory '{local_path}' not found.")
        return

    # 1. Initialize the S3 client
    print(f"Connecting to Garage S3 API at: {GARAGE_ENDPOINT}")
    s3_client = boto3.client(
        's3',
        endpoint_url=GARAGE_ENDPOINT,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
    )

    # 2. Iterate through all files in the local directory recursively
    for root, _, files in os.walk(local_path):
        for file_name in files:
            # Full path to the file on the local system
            local_file_path = os.path.join(root, file_name)

            # Determine the key (path) in the S3 bucket
            # 'rel_path' is the path relative to the starting folder (e.g., Subfolder/image.jpg)
            rel_path = os.path.relpath(local_file_path, local_path)
            
            # Combine the S3 prefix and the relative path, ensuring forward slashes for S3 key
            s3_key = os.path.join(prefix, rel_path).replace("\\", "/")

            # 3. Upload the file
            print(f"Uploading {local_file_path} to s3://{bucket_name}/{s3_key}")
            try:
                s3_client.upload_file(
                    local_file_path,
                    bucket_name,
                    s3_key
                )
            except Exception as e:
                print(f"Error uploading {file_name}. Check connectivity and key permissions: {e}")

    print("\n✅ Upload complete!")

if __name__ == "__main__":
    upload_directory_to_garage(LOCAL_DIRECTORY_PATH, BUCKET_NAME, S3_UPLOAD_PREFIX)