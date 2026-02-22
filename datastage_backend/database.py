import sqlite3
import os
import csv

DB_PATH = "datasage.db"
CUSTOMERS_CSV_PATH = os.environ.get("CUSTOMERS_CSV_PATH") or os.path.join(
    os.path.dirname(__file__), "customers.csv"
)


def _nullable(s):
    """Convert 'NULL' or empty string to None for SQLite."""
    if s is None or (isinstance(s, str) and s.strip().upper() in ("", "NULL")):
        return None
    return s.strip() if isinstance(s, str) else s


def init_db():
    """Create sample tables and insert demo data."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Employees table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            department TEXT,
            salary REAL,
            hire_date DATE
        )
    """)
    # Departments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            manager TEXT
        )
    """)

    # Customers table (training data for chatbot)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            customer_id INTEGER PRIMARY KEY,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            email TEXT,
            street TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT
        )
    """)

    # Insert sample data if tables are empty
    cursor.execute("SELECT COUNT(*) FROM employees")
    if cursor.fetchone()[0] == 0:
        cursor.executemany(
            "INSERT INTO employees (name, department, salary, hire_date) VALUES (?, ?, ?, ?)",
            [
                ("Alice Smith", "Engineering", 85000, "2021-06-01"),
                ("Bob Johnson", "Marketing", 72000, "2022-03-15"),
                ("Carol Lee", "Engineering", 92000, "2020-11-20"),
                ("David Brown", "Sales", 68000, "2023-01-10"),
            ]
        )
        cursor.executemany(
            "INSERT INTO departments (name, manager) VALUES (?, ?)",
            [
                ("Engineering", "Alice Smith"),
                ("Marketing", "Bob Johnson"),
                ("Sales", "David Brown"),
            ]
        )

    # Load customers from CSV (training dataset) if file exists
    load_customers_from_csv(conn, cursor)

    conn.commit()
    conn.close()


def load_customers_from_csv(conn=None, cursor=None):
    """Load customers from CSV into the customers table."""
    if not os.path.isfile(CUSTOMERS_CSV_PATH):
        return
    own_conn = False
    if conn is None:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        own_conn = True
    try:
        cursor.execute("DELETE FROM customers")
        with open(CUSTOMERS_CSV_PATH, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute(
                    """INSERT INTO customers (
                        customer_id, first_name, last_name, phone, email, street, city, state, zip_code
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        int(row.get("customer_id", 0)),
                        _nullable(row.get("first_name")),
                        _nullable(row.get("last_name")),
                        _nullable(row.get("phone")),
                        _nullable(row.get("email")),
                        _nullable(row.get("street")),
                        _nullable(row.get("city")),
                        _nullable(row.get("state")),
                        _nullable(row.get("zip_code")),
                    ),
                )
        if own_conn:
            conn.commit()
    finally:
        if own_conn:
            conn.close()


def get_db_connection():
    return sqlite3.connect(DB_PATH)

def get_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()
    return tables

def get_table_info(table_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    # columns: (cid, name, type, notnull, default, pk)
    result = []
    for col in columns:
        result.append({
            "name": col[1],
            "type": col[2],
            "nullable": not col[3],
            "primary_key": bool(col[5])
        })
    conn.close()
    return result

def get_table_preview(table_name, limit=5):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name} LIMIT ?", (limit,))
    rows = cursor.fetchall()
    col_names = [description[0] for description in cursor.description]
    conn.close()
    return col_names, rows

def get_table_stats(table_name):
    """Return row count and basic stats for numeric columns."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    row_count = cursor.fetchone()[0]

    # Get column info
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    stats = {}
    for col in columns:
        col_name = col[1]
        col_type = col[2].upper()
        # For numeric columns, compute min, max, avg
        if "INT" in col_type or "REAL" in col_type or "FLOAT" in col_type or "DOUBLE" in col_type:
            cursor.execute(f"SELECT MIN({col_name}), MAX({col_name}), AVG({col_name}) FROM {table_name}")
            min_val, max_val, avg_val = cursor.fetchone()
            stats[col_name] = {"min": min_val, "max": max_val, "avg": round(avg_val, 2) if avg_val else None}
        else:
            # For text columns, count distinct
            cursor.execute(f"SELECT COUNT(DISTINCT {col_name}) FROM {table_name}")
            distinct = cursor.fetchone()[0]
            stats[col_name] = {"distinct": distinct}
    conn.close()
    return row_count, stats


def get_chat_facts():
    """Return a small dict of facts for the chatbot fallback (no OpenAI)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    facts = {}
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = [row[0] for row in cursor.fetchall()]
        facts["tables"] = tables
        if "customers" in tables:
            cursor.execute("SELECT COUNT(*) FROM customers")
            facts["customer_count"] = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(DISTINCT state) FROM customers WHERE state IS NOT NULL")
            facts["customer_states"] = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(DISTINCT city) FROM customers WHERE city IS NOT NULL")
            facts["customer_cities"] = cursor.fetchone()[0]
            cursor.execute("SELECT state FROM customers WHERE state IS NOT NULL GROUP BY state ORDER BY COUNT(*) DESC LIMIT 5")
            facts["top_states"] = [row[0] for row in cursor.fetchall()]
    except Exception:
        pass
    conn.close()
    return facts