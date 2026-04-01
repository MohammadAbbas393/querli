import re
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.pool import StaticPool

BLOCKED_KEYWORDS = re.compile(
    r'\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|EXEC|EXECUTE|CALL)\b',
    re.IGNORECASE
)

def is_safe(sql: str) -> bool:
    """Reject any non-SELECT SQL."""
    stripped = sql.strip().upper()
    if not stripped.startswith("SELECT"):
        return False
    if BLOCKED_KEYWORDS.search(sql):
        return False
    return True

def get_schema(db_url: str, db_type: str) -> str:
    """Introspect database schema as a compact text representation."""
    try:
        engine = _make_engine(db_url, db_type)
        insp = inspect(engine)
        lines = []
        for table in insp.get_table_names():
            cols = [f"{c['name']} {c['type']}" for c in insp.get_columns(table)]
            lines.append(f"TABLE {table} ({', '.join(cols)})")
        engine.dispose()
        return "\n".join(lines) if lines else "No tables found."
    except Exception as e:
        return f"Schema unavailable: {e}"

def execute_query(db_url: str, db_type: str, sql: str) -> tuple[list[str], list[list], int]:
    """Execute a read-only SQL query and return (columns, rows, execution_ms)."""
    import time

    if not is_safe(sql):
        raise ValueError("Only SELECT queries are allowed.")

    engine = _make_engine(db_url, db_type)
    t0 = time.monotonic()
    try:
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            columns = list(result.keys())
            rows = [list(row) for row in result.fetchmany(500)]  # max 500 rows
        execution_ms = int((time.monotonic() - t0) * 1000)
        return columns, rows, execution_ms
    finally:
        engine.dispose()

def _make_engine(db_url: str, db_type: str):
    kwargs: dict = {"pool_pre_ping": True, "connect_args": {}}
    if db_type == "sqlite":
        kwargs = {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool}
    elif db_type == "mysql":
        if not db_url.startswith("mysql+pymysql"):
            db_url = db_url.replace("mysql://", "mysql+pymysql://")
    elif db_type == "postgres":
        if not db_url.startswith("postgresql+psycopg2"):
            db_url = db_url.replace("postgresql://", "postgresql+psycopg2://")
    return create_engine(db_url, **kwargs)
