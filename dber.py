import os
import psycopg2
from psycopg2 import sql
import boto3


def get_env(key, default):
    return os.getenv(key, default)

def main():
    # Try DATABASE_URL first
    # db_url = os.getenv("DATABASE_URL")
    db_url = "postgres://user:somepass@db:5432/myappdb?sslmode=disable"

    if not db_url:
        # Fallback identical to Go code logic
        DB_HOST = get_env("DB_HOST", "localhost")
        DB_PORT = get_env("DB_PORT", "5432")
        DB_USER = get_env("DB_USER", "postgres")
        DB_PASS = os.getenv("DB_PASSWORD")
        DB_NAME = get_env("DB_NAME", "postgres")

        if not DB_PASS:
            print("❌ ERROR: DB_PASSWORD or DATABASE_URL must be set")
            return

        db_url = f"postgres://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=disable"
        # postgres://user:somepass@db:5432/myappdb?sslmode=disable

    print("Connecting using URL:", db_url)
    print("Attempting to connect to PostgreSQL...")

    try:
        conn = psycopg2.connect(db_url)
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    print("✅ Connection established successfully.")
    print("Fetching list of tables...")

    query = """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """

    try:
        cur = conn.cursor()
        cur.execute(query)
        rows = cur.fetchall()
    except Exception as e:
        print(f"❌ Failed to fetch tables: {e}")
        conn.close()
        return

    if not rows:
        print("⚠️ No tables found in schema 'public'.")
    else:
        print("\n📌 Tables in 'public' schema:")
        for row in rows:
            print(" -", row[0])

    cur.close()
    conn.close()

    print("\nConnection closed.")

if __name__ == "__main__":
    main()
