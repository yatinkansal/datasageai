import sqlite3
from database import DB_PATH


def create_demo_db():
  """Create simple demo tables for training in the existing SQLite DB."""
  conn = sqlite3.connect(DB_PATH)
  cursor = conn.cursor()

  cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT,
        city TEXT,
        signup_date TEXT
    );
    """
  )

  cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        product_name TEXT,
        category TEXT,
        price REAL,
        stock INTEGER
    );
    """
  )

  cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        order_date TEXT,
        total_amount REAL
    );
    """
  )

  cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        subtotal REAL
    );
    """
  )

  conn.commit()
  conn.close()


if __name__ == "__main__":
  create_demo_db()
  print("Demo database created successfully!")

