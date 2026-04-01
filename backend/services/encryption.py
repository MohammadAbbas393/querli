import os
from cryptography.fernet import Fernet

def get_fernet() -> Fernet:
    key = os.environ["ENCRYPTION_KEY"]
    # Ensure proper padding for URL-safe base64
    return Fernet(key.encode() if isinstance(key, str) else key)

def encrypt(value: str) -> str:
    return get_fernet().encrypt(value.encode()).decode()

def decrypt(value: str) -> str:
    return get_fernet().decrypt(value.encode()).decode()
