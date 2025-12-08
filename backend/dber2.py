import os
import psycopg2
import boto3


def main():
    # --- DATABASE CONNECTION ---
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASS = os.getenv("DB_PASSWORD", "somepass")
    DB_NAME = os.getenv("DB_NAME", "postgres")

    if not DB_PASS:
        print("❌ DB_PASSWORD must be set")
        return

    db_url = f"postgres://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    db_url = "postgres://user:somepass@db:5432/myappdb?sslmode=disable"
    print("Connecting to PostgreSQL:", db_url)

    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = False  # ⛔ IMPORTANT: disable autocommit
        cur = conn.cursor()
        print("✅ Connected to PostgreSQL")
    except Exception as e:
        print("❌ Database connection failed:", e)
        return

    # --- GARAGE / S3 CONFIG ---
    S3_ENDPOINT = os.getenv("S3_ENDPOINT")
    ACCESS_KEY = os.getenv("S3_ACCESS_KEY_ID")
    SECRET_KEY = os.getenv("S3_SECRET_ACCESS_KEY")
    BUCKET = "images"

    if not S3_ENDPOINT or not ACCESS_KEY or not SECRET_KEY:
        print("❌ Missing S3 credentials or endpoint")
        return

    s3 = boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
    )

    print("\n📥 Fetching all objects from bucket:", BUCKET)

    try:
        response = s3.list_objects_v2(Bucket=BUCKET)
    except Exception as e:
        print("❌ Could not list bucket:", e)
        return

    if "Contents" not in response:
        print("⚠️ Bucket is empty")
        return

    # Start transaction block
    print("\n🚀 Starting transaction...")

    try:
        for obj in response["Contents"]:
            key = obj["Key"]

            if key.endswith("/"):
                continue

            if key == "uploaded_test.jpg":
                print("⏭️ Skipping test file:", key)
                continue

            print("\n🔍 Processing:", key)

            filename = key.split("/")[-1]
            parts = filename.split("_")

            if len(parts) < 2:
                print("⚠️ Could not parse species from:", filename)
                raise Exception("Failed to extract species name")

            # Build species name
            species_name = parts[0].capitalize() + " " + parts[1].lower()
            print("   → Species:", species_name)

            # Fetch species_id
            cur.execute(
                """
                SELECT species_id 
                FROM species_data 
                WHERE data->>'scientific_name' = %s
                """,
                (species_name,),
            )
            row = cur.fetchone()

            if not row:
                print("⚠️ No species found for:", species_name)
                raise Exception("Species not found in DB")

            species_id = row[0]
            print("   → species_id:", species_id)

            # Update JSONB
            cur.execute(
                """
                UPDATE species_data
                SET data = jsonb_set(
                    data,
                    '{image_urls}',
                    COALESCE(data->'image_urls','[]'::jsonb) || %s::jsonb
                )
                WHERE species_id = %s
                """,
                (f'["images/{filename}"]', species_id),
            )

            print("   ✅ Image added to image_urls")

        # If loop finishes: commit everything
        conn.commit()
        print("\n🎉 SUCCESS: All updates applied. Transaction committed.")

    except Exception as e:
        print("\n❌ ERROR:", e)
        print("⛔ Rolling back ALL changes...")
        conn.rollback()
        print("🗑️ Rollback complete. No changes were saved.")

    finally:
        cur.close()
        conn.close()
        print("\n🔚 Connection closed.\n")


if __name__ == "__main__":
    main()
