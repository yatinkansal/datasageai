"""Store current database connection config (for Connect UI). Backend uses SQLite by default."""
import json
import os

CONNECTION_PATH = os.path.join(os.path.dirname(__file__), "connection_config.json")

def save_connection(config):
    """Save connection config (type, host, port, username, database)."""
    try:
        with open(CONNECTION_PATH, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2)
    except OSError:
        pass

def get_connection():
    """Return saved connection config or None."""
    if not os.path.isfile(CONNECTION_PATH):
        return None
    try:
        with open(CONNECTION_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None
