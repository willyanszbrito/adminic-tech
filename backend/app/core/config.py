from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Adminic Smart Booking API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://ia.adminic.com.br",
        "https://adminic.com.br",
        "*"
    ]
    ENVIRONMENT: str = "development"
    APP_DOMAIN: str = "ia.adminic.com.br"
    API_DOMAIN: str = "api.adminic.com.br"
    PORT: int = int(os.getenv("PORT", "8000"))
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", None)

    # Google OAuth 2.0 & One Tap Settings
    GOOGLE_PROJECT_ID: str = os.getenv("GOOGLE_PROJECT_ID", "")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "adminic_default_secret_key_2026")

    # Mercado Pago PIX Payment Settings
    MERCADO_PAGO_PUBLIC_KEY: str = os.getenv("MERCADO_PAGO_PUBLIC_KEY", "")
    MERCADO_PAGO_PROD_PUBLIC_KEY: str = os.getenv("MERCADO_PAGO_PROD_PUBLIC_KEY", "")
    MERCADO_PAGO_CLIENT_ID: str = os.getenv("MERCADO_PAGO_CLIENT_ID", "")
    MERCADO_PAGO_USER_ID: str = os.getenv("MERCADO_PAGO_USER_ID", "")
    MERCADO_PAGO_ACCESS_TOKEN: Optional[str] = os.getenv("MERCADO_PAGO_ACCESS_TOKEN", None)

    # WhatsApp Notification & PythonAnywhere Settings
    PYTHONANYWHERE_USERNAME: str = os.getenv("PYTHONANYWHERE_USERNAME", "")
    PYTHONANYWHERE_TOKEN: str = os.getenv("PYTHONANYWHERE_TOKEN", "")
    WHATSAPP_API_ENABLED: bool = os.getenv("WHATSAPP_API_ENABLED", "true").lower() in ("true", "1", "t")
    META_ACCESS_TOKEN: Optional[str] = os.getenv("META_ACCESS_TOKEN", None)
    META_PHONE_ID: Optional[str] = os.getenv("META_PHONE_ID", None)
    META_API_VERSION: str = os.getenv("META_API_VERSION", "v25.0")

    # Gmail SMTP Email Notification Service
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "Adminic Agendamento Inteligente")
    SMTP_ENABLED: bool = os.getenv("SMTP_ENABLED", "true").lower() in ("true", "1", "t")


    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
