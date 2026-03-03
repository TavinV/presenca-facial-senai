from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import base64

load_dotenv()


class Settings(BaseSettings):
    FACIAL_API_KEY: str
    FACIAL_API_URL: str | None = None
    MAIN_API_URL: str
    SYNC_INTERVAL_SECONDS: int = 60
    PRODUCTION: bool = False
    FACE_MATCH_THRESHOLD: float
    FACE_MATCH_MARGIN: float
    AES_ENCRYPTION_KEY: str  
    
    @property
    def AES_KEY_BYTES(self) -> bytes:
        return base64.b64decode(self.AES_ENCRYPTION_KEY)

    class Config:
        env_file = ".env"


settings = Settings()
