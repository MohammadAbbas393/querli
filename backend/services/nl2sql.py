import os
from groq import Groq

_client: Groq | None = None

def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _client

def _parse_sql(raw: str) -> str:
    sql = raw.strip()
    if sql.startswith("```"):
        sql = sql.split("```")[1].strip()
        if sql.lower().startswith("sql"):
            sql = sql[3:].strip()
    return sql

def generate_sql(question: str, schema: str, db_type: str, previous_sql: str = "", error: str = "") -> str:
    """Convert a natural language question to SQL using Groq."""
    dialect_hint = {
        "postgres": "PostgreSQL",
        "mysql": "MySQL",
        "sqlite": "SQLite",
    }.get(db_type, "SQL")

    system = (
        f"You are an expert {dialect_hint} assistant. "
        "Generate ONLY a single valid SELECT SQL query — no explanations, no markdown, no backticks. "
        "The query must be read-only (SELECT only). "
        "IMPORTANT: Only use table and column names that exist in the schema below. "
        "If the user mentions a concept, map it to the closest matching table or column in the schema."
    )

    if error and previous_sql:
        user_content = (
            f"Database schema:\n{schema}\n\n"
            f"Question: {question}\n\n"
            f"Your previous SQL failed:\n{previous_sql}\n"
            f"Error: {error}\n\n"
            "Fix the SQL using only the table and column names that exist in the schema."
        )
    else:
        user_content = f"Database schema:\n{schema}\n\nQuestion: {question}"

    client = get_client()
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_content},
        ],
        max_tokens=400,
        temperature=0.1,
    )
    return _parse_sql(completion.choices[0].message.content)

def generate_summary(question: str, columns: list[str], rows: list, row_count: int) -> str:
    """Generate a plain-English summary of query results."""
    if row_count == 0:
        return "No results found."
    try:
        client = get_client()
        preview = str(rows[:5])
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": (
                    f"Question: {question}\n"
                    f"Results ({row_count} rows): columns={columns}, first rows={preview}\n"
                    "Summarize the key insight in 1 sentence."
                ),
            }],
            max_tokens=100,
            temperature=0.3,
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        return f"{row_count} rows returned."
