import boto3
import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# --- Configuration ---
GARAGE_ENDPOINT = 'http://72.61.231.140:3900'  # Replace with os.getenv("S3_ENDPOINT") when being run through cloud
ACCESS_KEY = os.getenv("GARAGE_ACCESS_KEY")
SECRET_KEY = os.getenv("GARAGE_SECRET_KEY")
BUCKET_NAME = "images"
# ----------------------

def upload_single_file_to_garage(file_path, bucket_name, s3_key):
    """
    Uploads exactly one file to your Garage S3 bucket.
    """
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found -> {file_path}")
        return

    print(f"Connecting to Garage S3 API at: {GARAGE_ENDPOINT}")

    # Initialize S3 client
    s3_client = boto3.client(
        "s3",
        endpoint_url=GARAGE_ENDPOINT,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
    )

    print(f"Uploading {file_path} -> s3://{bucket_name}/{s3_key}")

    try:
        s3_client.upload_file(file_path, bucket_name, s3_key)
        print("✅ Upload complete!")
    except Exception as e:
        print(f"❌ Upload failed: {e}")


if __name__ == "__main__":
    # Example usage:
    file_path = r"D:\SIH\imagedata\downloaded_images\abudefduf_saxatilis_1.jpg"  # change this to your image path
    s3_key = "uploaded_test.jpg"  # name inside the bucket

    upload_single_file_to_garage(file_path, BUCKET_NAME, s3_key)
