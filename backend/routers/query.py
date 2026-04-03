from fastapi import APIRouter, HTTPException
from database import get_db
from models import QueryRequest, QueryResponse
from services.encryption import decrypt
from services.executor import execute_query, get_schema
from services.nl2sql import generate_sql, generate_summary

router = APIRouter()

def guess_chart_type(columns: list[str], rows: list) -> str | None:
    """Guess whether the result suits a bar chart, line chart, or table."""
    if len(columns) == 2 and len(rows) <= 20:
        # Check if second col looks numeric
        try:
            float(rows[0][1]) if rows else None
            return "bar"
        except (TypeError, ValueError, IndexError):
            pass
    return "table"

@router.post("/query", response_model=QueryResponse)
async def run_query(req: QueryRequest):
    db = get_db()

    # Fetch connection
    conn_res = db.table("connections") \
        .select("encrypted_url, db_type, schema_cache") \
        .eq("id", req.connection_id) \
        .eq("user_id", req.user_id) \
        .single() \
        .execute()

    if not conn_res.data:
        raise HTTPException(404, "Connection not found")

    conn = conn_res.data
    db_url = decrypt(conn["encrypted_url"])
    db_type = conn["db_type"]

    # Get schema (use cache if available)
    schema = conn.get("schema_cache") or get_schema(db_url, db_type)

    # Cache schema in DB
    if not conn.get("schema_cache"):
        db.table("connections").update({"schema_cache": schema}).eq("id", req.connection_id).execute()

    # Generate SQL
    sql = generate_sql(req.question, schema, db_type)

    # Execute — retry once if it fails, feeding the error back to the LLM
    try:
        columns, rows, execution_ms = execute_query(db_url, db_type, sql)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as first_error:
        try:
            sql = generate_sql(req.question, schema, db_type, previous_sql=sql, error=str(first_error))
            columns, rows, execution_ms = execute_query(db_url, db_type, sql)
        except ValueError as e:
            raise HTTPException(400, str(e))
        except Exception:
            raise HTTPException(400, "no_data")

    chart_type = guess_chart_type(columns, rows)
    summary = generate_summary(req.question, columns, rows, len(rows))

    return QueryResponse(
        sql=sql,
        columns=columns,
        rows=rows,
        chart_type=chart_type,
        execution_ms=execution_ms,
        summary=summary,
    )
