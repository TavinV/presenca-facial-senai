from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    FACIAL_API_KEY: str
    FACIAL_API_URL: str | None = None
    MAIN_API_URL: str
    SYNC_INTERVAL_SECONDS: int = 60

    FACE_MATCH_THRESHOLD: float = 0.6

    class Config:
        env_file = ".env"


settings = Settings()
