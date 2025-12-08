import psycopg2

# --- Database Configuration ---
DB_HOST = '72.61.231.140'
DB_PORT = '5432'
DB_NAME = 'myappdb'
DB_USER = 'user'
DB_PASS = 'somepass'

# --- Query to Test ---
TEST_QUERY = 'SELECT * FROM "region_metadata" LIMIT 1'

def test_db_connection_and_query():
    """Connects to the PostgreSQL database and executes a test query."""
    conn = None
    try:
        # 1. Establish the connection
        print("Attempting to connect to PostgreSQL...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        print("✅ Connection established successfully.")

        # 2. Create a cursor object to execute SQL commands
        cur = conn.cursor()

        # 3. Execute the test query
        print(f"Executing query: {TEST_QUERY}")
        cur.execute(TEST_QUERY)

        # 4. Fetch the results (just one row due to LIMIT 1)
        row = cur.fetchone()

        # 5. Get column names
        column_names = [desc[0] for desc in cur.description]
        
        # 6. Display the results
        if row:
            print("\n--- Query Result ---")
            print(f"Columns: {column_names}")
            print(f"Data: {row}")
            print("Successfully retrieved data.")
        else:
            print("Query succeeded, but returned no rows (the table might be empty).")

        # 7. Close cursor and connection
        cur.close()

    except psycopg2.Error as e:
        print(f"\n❌ Database Connection Error: {e}")
        print("Please check your host IP, port, credentials, and ensure the DB is running and accessible.")

    finally:
        if conn is not None:
            conn.close()
            print("Connection closed.")

if __name__ == "__main__":
    test_db_connection_and_query()