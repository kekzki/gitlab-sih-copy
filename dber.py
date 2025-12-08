import psycopg2

# --- Database Configuration ---
DB_HOST = '72.61.231.140'
DB_PORT = '5432'
DB_NAME = 'myappdb'
DB_USER = 'user'
DB_PASS = 'somepass'

# SQL query to list all non-system tables (BASE TABLE type)
LIST_TABLES_QUERY = """
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
AND table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY table_schema, table_name;
"""

def list_all_tables():
    """Connects to the database and prints all user-defined tables and their schemas."""
    conn = None
    try:
        # 1. Establish the connection
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, database=DB_NAME,
            user=DB_USER, password=DB_PASS
        )
        cur = conn.cursor()
        print("✅ Connection established successfully.")

        # 2. Execute the table listing query
        cur.execute(LIST_TABLES_QUERY)
        results = cur.fetchall()

        # 3. Display the results
        if not results:
            print("\n❌ No user-defined tables found in the database.")
            return

        print("\n--- All User-Defined Tables Found ---")
        
        # Group tables by schema for clarity
        tables_by_schema = {}
        for schema, table in results:
            tables_by_schema.setdefault(schema, []).append(table)
        
        for schema, tables in tables_by_schema.items():
            print(f"\n[Schema: **{schema}**]")
            for table in tables:
                print(f"  - {table}")
        
        print("\n-------------------------------------")

        # 4. Use the full name (schema.table) for querying
        print("To query a table, use the full name: **schema.table_name**")
        
        cur.close()

    except psycopg2.Error as e:
        print(f"\n❌ Database Connection or Query Error: {e}")
    finally:
        if conn is not None:
            conn.close()
            print("Connection closed.")

if __name__ == "__main__":
    list_all_tables()