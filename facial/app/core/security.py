from fastapi import Header, HTTPException, status
from app.core.settings import settings

FACIAL_API_KEY = settings.FACIAL_API_KEY

def verify_api_key(x_facial_api_key: str = Header(...)):
    if x_facial_api_key != FACIAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
