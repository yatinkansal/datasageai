from flask import Flask, jsonify, request
from flask_cors import CORS
import database
import ai
import settings_store
import connection_store

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (useful during development)

# Initialize the database on startup
database.init_db()


def _current_db_stats():
    """Return current table count and total column count from backend DB."""
    tables = database.get_tables()
    total_cols = sum(
        len(database.get_table_info(t)) for t in tables
    )
    return {"tables": len(tables), "columns": total_cols}


@app.route('/connect', methods=['POST'])
def connect_database():
    """Save connection config and return success with current DB stats (Dashboard uses same DB)."""
    data = request.get_json() or {}
    config = {
        "type": data.get("type", "sqlite"),
        "host": data.get("host", ""),
        "port": data.get("port", ""),
        "username": data.get("username", ""),
        "database": data.get("database", "datasage.db"),
    }
    connection_store.save_connection(config)
    stats = _current_db_stats()
    return jsonify({
        "success": True,
        "message": "Connection saved. Backend is using the configured data source.",
        **stats,
    })


@app.route('/connection-status', methods=['GET'])
def connection_status():
    """Return saved connection config and current DB stats."""
    config = connection_store.get_connection()
    stats = _current_db_stats()
    return jsonify({
        "connected": config is not None,
        "config": config,
        **stats,
    })


@app.route('/')
def health_check():
    return jsonify({"status": "ok", "message": "DataSage AI backend is running"})

@app.route('/extract', methods=['GET'])
def extract_metadata():
    """Return all tables and their columns."""
    tables = database.get_tables()
    result = {}
    for table in tables:
        columns = database.get_table_info(table)
        result[table] = columns
    return jsonify(result)

@app.route('/profile/<table>', methods=['GET'])
def profile_table(table):
    """Return detailed profile for a specific table."""
    if table not in database.get_tables():
        return jsonify({"error": "Table not found"}), 404

    columns = database.get_table_info(table)
    col_names, sample_rows = database.get_table_preview(table)
    row_count, stats = database.get_table_stats(table)

    return jsonify({
        "table": table,
        "columns": columns,
        "row_count": row_count,
        "sample": [dict(zip(col_names, row)) for row in sample_rows],
        "statistics": stats
    })

@app.route('/generate-doc/<table>', methods=['GET'])
def generate_doc(table):
    """Generate AI documentation for a table."""
    if table not in database.get_tables():
        return jsonify({"error": "Table not found"}), 404

    columns = database.get_table_info(table)
    col_names, sample_rows = database.get_table_preview(table, limit=3)
    sample_data = [dict(zip(col_names, row)) for row in sample_rows]

    doc = ai.generate_documentation(
        table_name=table,
        columns=[c["name"] for c in columns],
        sample_rows=sample_data
    )
    return jsonify({"documentation": doc})


@app.route('/generate-doc/<table>/<column>', methods=['GET'])
def generate_doc_column(table, column):
    """Generate AI documentation for a single column."""
    if table not in database.get_tables():
        return jsonify({"error": "Table not found"}), 404
    columns = database.get_table_info(table)
    col_names = [c["name"] for c in columns]
    if column not in col_names:
        return jsonify({"error": "Column not found"}), 404
    col_info = next(c for c in columns if c["name"] == column)
    col_names, sample_rows = database.get_table_preview(table, limit=20)
    idx = col_names.index(column)
    sample_vals = [str(row[idx]) for row in sample_rows if row[idx] is not None][:10]
    doc = ai.generate_column_documentation(
        table_name=table,
        column_name=column,
        column_type=col_info.get("type", "unknown"),
        sample_values=sample_vals,
    )
    return jsonify({"documentation": doc})


@app.route('/chat', methods=['POST'])
def chat():
    """Answer a question using AI (uses DB schema + customers training data)."""
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "Missing 'question' in request body"}), 400

    tables = database.get_tables()
    context = []
    for t in tables:
        cols = database.get_table_info(t)
        context.append(f"{t}({', '.join(c['name'] for c in cols)})")
    context_str = "; ".join(context)

    # Add training data context for customers table (sample rows + count)
    extra = None
    if "customers" in tables:
        try:
            row_count, _ = database.get_table_stats("customers")
            col_names, sample_rows = database.get_table_preview("customers", limit=8)
            sample_str = "\n".join(
                str(dict(zip(col_names, row))) for row in sample_rows
            )
            extra = (
                f"customers table has {row_count} rows. "
                f"Columns: customer_id, first_name, last_name, phone, email, street, city, state, zip_code. "
                f"Sample rows:\n{sample_str}"
            )
        except Exception:
            pass

    data_facts = database.get_chat_facts()
    answer = ai.chat_with_ai(
        data["question"],
        context_str,
        extra_context=extra,
        data_facts=data_facts,
    )
    return jsonify({"answer": answer})

# --- User settings (profile + notifications) ---
@app.route('/settings', methods=['GET'])
def get_settings():
    """Return current user profile and notification preferences."""
    return jsonify(settings_store.get_settings())


@app.route('/settings/profile', methods=['PUT', 'PATCH'])
def update_profile():
    """Update profile: firstName, lastName, email."""
    data = request.get_json()
    if data is None:
        return jsonify({"error": "Invalid JSON body"}), 400
    kwargs = {}
    if 'firstName' in data:
        kwargs['first_name'] = str(data['firstName'])
    if 'lastName' in data:
        kwargs['last_name'] = str(data['lastName'])
    if 'email' in data:
        kwargs['email'] = str(data['email'])
    if not kwargs:
        return jsonify(settings_store.get_settings())
    try:
        settings_store.update_profile(**kwargs)
    except Exception as e:
        return jsonify({"error": "Failed to save profile", "detail": str(e)}), 500
    return jsonify(settings_store.get_settings())


@app.route('/settings/notifications', methods=['PUT', 'PATCH'])
def update_notifications():
    """Update notification preferences: schemaChanges, aiInsights, dataQualityAlerts."""
    data = request.get_json() or {}
    kwargs = {}
    if 'schemaChanges' in data:
        kwargs['schema_changes'] = data['schemaChanges']
    if 'aiInsights' in data:
        kwargs['ai_insights'] = data['aiInsights']
    if 'dataQualityAlerts' in data:
        kwargs['data_quality_alerts'] = data['dataQualityAlerts']
    if kwargs:
        settings_store.update_notifications(**kwargs)
    return jsonify(settings_store.get_settings())


@app.route('/generate-sql', methods=['POST'])
def generate_sql_endpoint():
    """Convert natural language to SQL."""
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({"error": "Missing 'query' in request body"}), 400

    # Build schema description
    tables = database.get_tables()
    schema_lines = []
    for t in tables:
        cols = database.get_table_info(t)
        col_defs = [f"{c['name']} {c['type']}" for c in cols]
        schema_lines.append(f"CREATE TABLE {t} ({', '.join(col_defs)});")
    schema = "\n".join(schema_lines)

    sql = ai.generate_sql(data['query'], schema)
    return jsonify({"sql": sql})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)