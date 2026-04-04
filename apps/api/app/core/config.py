from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "1998 Recording Studio API"
    ENV: str = "development"
    API_CORS_ORIGINS: str = "http://localhost:3000"
    DATABASE_URL: str = "postgresql+psycopg2://studio:studio@localhost:5432/studio_db"
    JWT_SECRET_KEY: str = "change_me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 720
    WORKING_HOURS_START: str = "10:00"
    WORKING_HOURS_END: str = "22:00"
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM: str = "noreply@1998studio.it"
    ADMIN_EMAIL: str = "admin@1998studio.it"
    ADMIN_PASSWORD: str = "admin123"
    GOOGLE_CALENDAR_ENABLED: bool = False
    GOOGLE_CALENDAR_ID: str | None = None
    GOOGLE_CALENDAR_TIMEZONE: str = "Europe/Rome"
    GOOGLE_SERVICE_ACCOUNT_FILE: str | None = None
    GOOGLE_SERVICE_ACCOUNT_JSON: str | None = None

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.API_CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
