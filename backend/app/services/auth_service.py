"""Auth business logic — email/password + Google OAuth session handling.

All authenticated requests are cookie-authenticated: a random `session_token`
is stored in ``user_sessions`` and mirrored to an httpOnly cookie on the
client. A JWT is still returned by ``signup``/``login`` for programmatic
Bearer use, but browser clients no longer need to store it.
"""
from __future__ import annotations

import logging
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

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

SESSION_TTL_DAYS = 7


def _new_user_id() -> str:
    return f"user_{uuid.uuid4().hex[:12]}"


def _new_session_token() -> str:
    # 32 bytes urlsafe = 256-bit entropy
    return secrets.token_urlsafe(32)


async def create_session(user_id: str, provider: str) -> Tuple[str, datetime]:
    """Persist a new session row for the user and return (token, expires_at)."""
    db = get_db()
    session_token = _new_session_token()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=SESSION_TTL_DAYS)
    await db.user_sessions.insert_one(
        {
            "session_token": session_token,
            "user_id": user_id,
            "expires_at": expires_at,
            "created_at": now,
            "provider": provider,
        }
    )
    return session_token, expires_at


def _to_user_public(doc: dict) -> UserPublic:
    created_at = doc.get("created_at")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at)
        except ValueError:
            created_at = None
    if created_at and created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return UserPublic(**{**doc, "created_at": created_at})


async def signup(payload: SignupPayload) -> Tuple[LoginResult, str, datetime]:
    """Create a new user. Returns (LoginResult, session_token, expires_at)."""
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
    session_token, expires_at = await create_session(user_id, provider="email")
    login_result = LoginResult(
        user=_to_user_public({**user_doc, "created_at": now}),
        access_token=token,
    )
    return login_result, session_token, expires_at


async def login(email: str, password: str) -> Tuple[LoginResult, str, datetime]:
    db = get_db()
    email = email.strip().lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    token = create_access_token(user["user_id"], extra={"email": email})
    session_token, expires_at = await create_session(user["user_id"], provider="email")
    login_result = LoginResult(user=_to_user_public(user), access_token=token)
    return login_result, session_token, expires_at


# ---------------------------------------------------------------------------
# Google OAuth (Emergent-managed)
# ---------------------------------------------------------------------------


async def _fetch_emergent_session(session_id: str) -> dict:
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
    return resp.json()


async def _upsert_google_user(payload: dict) -> dict:
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
        return user_doc

    await db.users.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "name": payload.get("name") or user["name"],
                "picture": payload.get("picture") or user.get("picture"),
            }
        },
    )
    return user


async def exchange_google_session(session_id: str) -> dict:
    """Exchange an Emergent OAuth ``session_id`` for a persistent app session.

    Returns a dict with ``user``, ``session_token`` and ``expires_at``.
    """
    payload = await _fetch_emergent_session(session_id)
    user = await _upsert_google_user(payload)
    # Prefer Emergent-provided session token if present; otherwise mint one.
    session_token = payload.get("session_token") or _new_session_token()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=SESSION_TTL_DAYS)
    db = get_db()
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
