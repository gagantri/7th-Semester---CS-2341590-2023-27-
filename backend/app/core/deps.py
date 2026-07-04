"""FastAPI dependencies for auth resolution."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

import jwt
from fastapi import Cookie, Header, HTTPException, status

from app.core.db import get_db
from app.core.security import decode_token


async def _lookup_user(user_id: str) -> Optional[dict]:
    db = get_db()
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    session_token: Optional[str] = Cookie(default=None),
) -> dict:
    """Resolve the current user via either:
    * ``Authorization: Bearer <access_token>`` — JWT for email/password auth.
    * ``session_token`` cookie — for Emergent Google OAuth sessions.
    Returns the user document (without MongoDB _id) or raises 401.
    """
    db = get_db()

    # 1. Try session cookie first (Google OAuth path)
    token_from_cookie = session_token
    if not token_from_cookie and authorization:
        # Bearer might be an OAuth session token too; try both interpretations
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token_from_cookie = parts[1]

    if token_from_cookie:
        session_doc = await db.user_sessions.find_one(
            {"session_token": token_from_cookie}, {"_id": 0}
        )
        if session_doc:
            expires_at = session_doc.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at and expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at and expires_at < datetime.now(timezone.utc):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED, "Session expired"
                )
            user = await _lookup_user(session_doc["user_id"])
            if user:
                return user

    # 2. Try JWT (email/password)
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            try:
                payload = decode_token(parts[1])
                user_id = payload.get("sub")
                if user_id:
                    user = await _lookup_user(user_id)
                    if user:
                        return user
            except jwt.PyJWTError:
                pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )


async def get_optional_user(
    authorization: Optional[str] = Header(default=None),
    session_token: Optional[str] = Cookie(default=None),
) -> Optional[dict]:
    """Same as ``get_current_user`` but returns None instead of 401."""
    try:
        return await get_current_user(authorization, session_token)
    except HTTPException:
        return None
