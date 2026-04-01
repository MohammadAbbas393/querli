import os
from groq import Groq

_client: Groq | None = None

def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _client

def generate_sql(question: str, schema: str, db_type: str) -> str:
    """Convert a natural language question to SQL using Groq."""
    dialect_hint = {
        "postgres": "PostgreSQL",
        "mysql": "MySQL",
        "sqlite": "SQLite",
    }.get(db_type, "SQL")

    client = get_client()
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    f"You are an expert {dialect_hint} assistant. "
                    "Generate ONLY a single valid SELECT SQL query — no explanations, no markdown, no backticks. "
                    "The query must be read-only (SELECT only). "
                    "Use the exact table and column names from the schema provided."
                ),
            },
            {
                "role": "user",
                "content": f"Database schema:\n{schema}\n\nQuestion: {question}",
            },
        ],
        max_tokens=400,
        temperature=0.1,
    )
    sql = completion.choices[0].message.content.strip()
    # Strip any accidental markdown fences
    if sql.startswith("```"):
        sql = sql.split("```")[1].strip()
        if sql.lower().startswith("sql"):
            sql = sql[3:].strip()
    return sql

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
