def generate_column_documentation(table_name, column_name, column_type, sample_values):
    """Generate mock AI description for a single column."""
    return f"This column stores {column_name} data of type {column_type}. Example values include: {', '.join(sample_values[:3])}."


def generate_documentation(table_name, columns, sample_rows):
    """Return a descriptive text about the table."""
    return (
        f"The **{table_name}** table stores information about {table_name.lower()}. "
        f"It contains columns: {', '.join(columns)}. "
        f"Use this table to analyze trends and relationships."
    )


def chat_with_ai(question, context, extra_context=None, data_facts=None):
    """Return a varied, data-driven answer when AI is not available."""
    q = (question or "").strip().lower()
    facts = data_facts or {}
    tables = facts.get("tables", [])
    customer_count = facts.get("customer_count", 0)
    customer_states = facts.get("customer_states", 0)
    customer_cities = facts.get("customer_cities", 0)
    top_states = facts.get("top_states", [])

    if not q or q in ("hi", "hello", "hey", "hii", "hi there", "hey there"):
        parts = ["Hi! I'm your local data assistant. No API key required!"]
        if customer_count:
            parts.append(f" We have **{customer_count}** customers in the database.")
        if tables:
            parts.append(f" Available tables: {', '.join(tables)}.")
        parts.append(" Ask me things like: 'How many customers?', 'Which states have customers?', or 'What tables do we have?'")
        return " ".join(parts)

    if "how many customer" in q or "customer count" in q or "number of customer" in q or "total customer" in q:
        if customer_count:
            return f"There are exactly **{customer_count}** customers recorded in your database."
        return "The customers table is currently empty or not loaded yet."

    if "what table" in q or "list table" in q or "which table" in q or "tables do we have" in q or "tables are there" in q:
        if tables:
            return f"Available database tables: **{', '.join(tables)}**. You can ask me specific questions about their contents."
        return "No tables are currently available in the database."

    if "state" in q or "city" in q or "where are customer" in q or "location" in q:
        if customer_count:
            msg = f"We currently have **{customer_count}** customers spread across **{customer_states}** states and **{customer_cities}** unique cities."
            if top_states:
                msg += f" The states with the highest number of customers are: {', '.join(top_states)}."
            return msg
        return "Customer location data is not available."
        
    if "first name" in q or "last name" in q or "name" in q:
        return f"Customer names are stored in the 'first_name' and 'last_name' columns of the 'customers' table."
        
    if "email" in q or "contact" in q or "phone" in q:
        return f"Contact information such as emails and phone numbers are available in the 'customers' table."

    suggestions = []
    if customer_count:
        suggestions.append("'How many customers do we have?'")
    if tables:
        suggestions.append("'What tables are in the database?'")
    suggestions.append("'Which states have the most customers?'")
    return (
        f"I'm a local AI assistant and I don't know the answer to that yet. Try asking: {', '.join(suggestions)}"
    )


def generate_sql(natural_language, schema):
    """Convert natural language to SQL query using hardcoded generic logic."""
    q = (natural_language or "").strip().lower()
    
    if "count" in q and "customer" in q:
        return "SELECT COUNT(*) FROM customers;"
    
    if "state" in q and "customer" in q:
        return "SELECT state, COUNT(*) as count FROM customers GROUP BY state ORDER BY count DESC LIMIT 5;"
        
    if "city" in q and "customer" in q:
        return "SELECT city, COUNT(*) as count FROM customers GROUP BY city ORDER BY count DESC LIMIT 5;"

    # Default generic query
    return "SELECT * FROM customers LIMIT 10;"
