from pydantic import BaseModel
from typing import Optional

class QueryRequest(BaseModel):
    connection_id: str
    question: str
    user_id: str

class QueryResponse(BaseModel):
    sql: str
    columns: list[str]
    rows: list[list]
    chart_type: Optional[str]
    execution_ms: int
    summary: Optional[str] = None

class EncryptRequest(BaseModel):
    value: str

class EncryptResponse(BaseModel):
    encrypted: str
