from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RFQ Dashboard"
    # Updated to use 'murshi.' as user, empty password (common for homebrew postgres)
    DATABASE_URL: str = "postgresql+asyncpg://murshi.@localhost/rfq_auth_db"
    SECRET_KEY: str = "supersecretkeywow"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
