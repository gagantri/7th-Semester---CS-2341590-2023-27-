"""FastAPI dependencies for auth resolution.

Extracts token from Bearer header or session cookie, resolves the user, and
raises 401 when nothing matches. Split into small helpers for testability.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, Tuple

import jwt
from fastapi import Cookie, Header, HTTPException, status

from app.core.db import get_db
from app.core.security import decode_token


async def _lookup_user(user_id: str) -> Optional[dict]:
    db = get_db()
    return await db.users.find_one({"user_id": user_id}, {"_id": 0})


def _extract_bearer(authorization: Optional[str]) -> Optional[str]:
    """Return the raw Bearer token from an ``Authorization`` header or None."""
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def _pick_session_token(
    session_cookie: Optional[str], bearer: Optional[str]
) -> Optional[str]:
    """Prefer the session cookie; fall back to Bearer (allows either transport)."""
    return session_cookie or bearer


def _normalize_expiry(expires_at) -> Optional[datetime]:
    if not expires_at:
        return None
    if isinstance(expires_at, str):
        try:
            expires_at = datetime.fromisoformat(expires_at)
        except ValueError:
            return None
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at


async def _resolve_via_session(token: str) -> Tuple[Optional[dict], bool]:
    """Return (user, expired). ``user`` is None if no session matches.
    ``expired`` is True only when the session exists but is past its TTL.
    """
    db = get_db()
    session_doc = await db.user_sessions.find_one(
        {"session_token": token}, {"_id": 0}
    )
    if not session_doc:
        return None, False
    expires_at = _normalize_expiry(session_doc.get("expires_at"))
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None, True
    user = await _lookup_user(session_doc["user_id"])
    return user, False


async def _resolve_via_jwt(token: str) -> Optional[dict]:
    try:
        payload = decode_token(token)
    except jwt.PyJWTError:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return await _lookup_user(user_id)


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    session_token: Optional[str] = Cookie(default=None),
) -> dict:
    """Resolve the current user via either:

    * ``session_token`` cookie — preferred (works for both email/password and
      Google OAuth sessions).
    * ``Authorization: Bearer <token>`` — either an app JWT or a session token.
    """
    bearer = _extract_bearer(authorization)
    session_candidate = _pick_session_token(session_token, bearer)

    if session_candidate:
        user, expired = await _resolve_via_session(session_candidate)
        if expired:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired"
            )
        if user:
            return user

    if bearer:
        user = await _resolve_via_jwt(bearer)
        if user:
            return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
    )


async def get_optional_user(
    authorization: Optional[str] = Header(default=None),
    session_token: Optional[str] = Cookie(default=None),
) -> Optional[dict]:
    """Same as ``get_current_user`` but returns None instead of raising 401."""
    try:
        return await get_current_user(authorization, session_token)
    except HTTPException:
        return None
