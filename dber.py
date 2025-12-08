import os
import psycopg2
import boto3


def main():
    # --- DATABASE CONNECTION ---
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_USER = os.getenv("DB_USER")
    DB_PASS = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")

    if not DB_PASS:
        print("❌ DB_PASSWORD must be set")
        return

    db_url = f"postgres://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    print("Connecting to PostgreSQL:", db_url)

    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = False  # ⛔ IMPORTANT: disable autocommit
        cur = conn.cursor()
        print("✅ Connected to PostgreSQL")
    except Exception as e:
        print("❌ Database connection failed:", e)
        return

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
