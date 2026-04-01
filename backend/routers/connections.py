from fastapi import APIRouter
from models import EncryptRequest, EncryptResponse
from services.encryption import encrypt

router = APIRouter()

@router.post("/encrypt", response_model=EncryptResponse)
async def encrypt_value(req: EncryptRequest):
    """Encrypt a connection string. Called by the Next.js API before storing."""
    return EncryptResponse(encrypted=encrypt(req.value))
