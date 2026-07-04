"""Application configuration.

Centralised settings loaded from environment variables. Keep secrets out of code.
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from pydantic import BaseModel

# Load .env at import time (must happen before env reads).
ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


class Settings(BaseModel):
    # App
    app_name: str = os.environ.get("APP_NAME", "GavixaCare")
    app_env: str = os.environ.get("APP_ENV", "development")

    # Mongo
    mongo_url: str = os.environ["MONGO_URL"]
    db_name: str = os.environ["DB_NAME"]

    # CORS
    cors_origins: List[str] = [
        o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()
    ]

    # LLM
    emergent_llm_key: str = os.environ.get("EMERGENT_LLM_KEY", "")
    default_ai_provider: str = os.environ.get("DEFAULT_AI_PROVIDER", "anthropic")
    default_ai_model: str = os.environ.get(
        "DEFAULT_AI_MODEL", "claude-sonnet-4-5-20250929"
    )

    # Auth (Email/JWT)
    jwt_secret_key: str = os.environ.get(
        "JWT_SECRET_KEY", "gavixacare-dev-secret"
    )
    jwt_algorithm: str = os.environ.get("JWT_ALGORITHM", "HS256")
    jwt_access_expire_minutes: int = int(
        os.environ.get("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    )
    jwt_refresh_expire_days: int = int(
        os.environ.get("JWT_REFRESH_TOKEN_EXPIRE_DAYS", 7)
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
