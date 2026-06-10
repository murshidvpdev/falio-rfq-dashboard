from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RFQ Dashboard"
    # Updated to use 'murshi.' as user, empty password (common for homebrew postgres)
    DATABASE_URL: str = "postgresql+asyncpg://murshi.@localhost/rfq_auth_db"
    SECRET_KEY: str = "supersecretkeywow"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # Comma-separated list of allowed CORS origins, e.g. "https://app.example.com,https://example.com"
    ALLOWED_ORIGINS: str = "*"

    class Config:
        env_file = ".env"

    @property
    def cors_origins(self) -> list[str]:
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
