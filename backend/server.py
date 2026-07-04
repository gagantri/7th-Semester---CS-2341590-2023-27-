"""GavixaCare FastAPI application entrypoint.

Runs on port 8001 via supervisor. All routes are mounted under ``/api``.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.db import close_db
from app.routers import ai as ai_router
from app.routers import auth as auth_router
from app.routers import emergency as emergency_router
from app.routers import hospitals as hospitals_router
from app.routers import vault as vault_router
from app.services.auth_service import seed_demo_user
from app.services.hospital_seed import seed_hospitals

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("gavixacare")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s (%s)", settings.app_name, settings.app_env)
    try:
        await seed_hospitals()
        await seed_demo_user()
    except Exception:  # pragma: no cover
        logger.exception("Startup seeding failed \u2014 continuing anyway.")
    yield
    await close_db()


app = FastAPI(
    title="GavixaCare API",
    description=(
        "Transparent healthcare for every Indian family. All routes are under /api."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {
        "app": settings.app_name,
        "tagline": "Clarity in Healthcare. Confidence in Every Decision.",
        "status": "ok",
    }


@api_router.get("/health")
async def health():
    return {"status": "ok"}


api_router.include_router(auth_router.router)
api_router.include_router(hospitals_router.router)
api_router.include_router(ai_router.router)
api_router.include_router(emergency_router.router)
api_router.include_router(vault_router.router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.cors_origins if settings.cors_origins != ["*"] else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
