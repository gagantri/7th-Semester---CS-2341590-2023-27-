"""Auth business logic (email/password + Google OAuth session bootstrapping)."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from fastapi import HTTPException, status

from app.core.db import get_db
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.schemas.user import LoginResult, SignupPayload, UserPublic

logger = logging.getLogger(__name__)

EMERGENT_SESSION_ENDPOINT = (
    "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
)


def _new_user_id() -> str:
    return f"user_{uuid.uuid4().hex[:12]}"


async def signup(payload: SignupPayload) -> LoginResult:
    db = get_db()
    email = payload.email.strip().lower()
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user_id = _new_user_id()
    now = datetime.now(timezone.utc)
    user_doc = {
        "user_id": user_id,
        "email": email,
        "name": payload.name.strip(),
        "password_hash": hash_password(payload.password),
        "auth_provider": "email",
        "role": "patient",
        "default_city": payload.default_city,
        "language": "en",
        "picture": None,
        "created_at": now.isoformat(),
    }
    await db.users.insert_one(user_doc)

    token = create_access_token(user_id, extra={"email": email})
    return LoginResult(
        user=UserPublic(**user_doc, created_at=now),
        access_token=token,
    )


async def login(email: str, password: str) -> LoginResult:
    db = get_db()
    email = email.strip().lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    token = create_access_token(user["user_id"], extra={"email": email})
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at)
        except ValueError:
            created_at = None
    return LoginResult(
        user=UserPublic(**{**user, "created_at": created_at}),
        access_token=token,
    )


async def exchange_google_session(session_id: str) -> dict:
    """Exchange Emergent OAuth session_id for a persistent app session."""
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            EMERGENT_SESSION_ENDPOINT,
            headers={"X-Session-ID": session_id},
        )
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google OAuth session invalid or expired.",
        )
    payload = resp.json()
    email = (payload.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not return an email.",
        )

    db = get_db()
    now = datetime.now(timezone.utc)
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_doc = {
            "user_id": _new_user_id(),
            "email": email,
            "name": payload.get("name") or email.split("@")[0],
            "picture": payload.get("picture"),
            "auth_provider": "google",
            "role": "patient",
            "default_city": None,
            "language": "en",
            "password_hash": None,
            "created_at": now.isoformat(),
        }
        await db.users.insert_one(user_doc)
        user = user_doc
    else:
        # Update picture/name if Google refreshed them
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {
                "$set": {
                    "name": payload.get("name") or user["name"],
                    "picture": payload.get("picture") or user.get("picture"),
                }
            },
        )

    session_token = payload.get("session_token") or uuid.uuid4().hex
    expires_at = now + timedelta(days=7)
    await db.user_sessions.insert_one(
        {
            "session_token": session_token,
            "user_id": user["user_id"],
            "expires_at": expires_at,
            "created_at": now,
            "provider": "google",
        }
    )
    return {
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "picture": user.get("picture"),
            "role": user.get("role", "patient"),
            "auth_provider": "google",
        },
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
    }


async def logout(session_token: Optional[str]) -> None:
    if not session_token:
        return
    db = get_db()
    await db.user_sessions.delete_many({"session_token": session_token})


async def seed_demo_user() -> None:
    """Ensure a deterministic demo user exists for testing/QA."""
    db = get_db()
    email = "demo@gavixacare.in"
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        return
    now = datetime.now(timezone.utc)
    await db.users.insert_one(
        {
            "user_id": "user_demo_gavixacare",
            "email": email,
            "name": "Demo Patient",
            "password_hash": hash_password("Demo@1234"),
            "auth_provider": "email",
            "role": "patient",
            "default_city": "Delhi",
            "language": "en",
            "picture": None,
            "created_at": now.isoformat(),
        }
    )
    logger.info("Seeded demo user: %s / Demo@1234", email)
