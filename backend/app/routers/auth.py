"""Auth router — email/password + Google OAuth.

All successful auth paths now set a single httpOnly ``session_token`` cookie.
This removes the need for the browser to store JWTs in ``localStorage``.
"""
from __future__ import annotations

import logging
from datetime import timezone
from typing import Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.schemas.user import (
    LoginPayload,
    LoginResult,
    ProfileUpdate,
    SignupPayload,
    UserPublic,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7  # 7 days


class GoogleSessionPayload(BaseModel):
    session_id: str


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="session_token",
        value=token,
        max_age=COOKIE_MAX_AGE_SECONDS,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )


@router.post("/signup", response_model=LoginResult)
async def signup(payload: SignupPayload, response: Response):
    result, session_token, _ = await auth_service.signup(payload)
    _set_session_cookie(response, session_token)
    return result


@router.post("/login", response_model=LoginResult)
async def login(payload: LoginPayload, response: Response):
    result, session_token, _ = await auth_service.login(
        payload.email, payload.password
    )
    _set_session_cookie(response, session_token)
    return result


@router.post("/google/session")
async def google_session(payload: GoogleSessionPayload, response: Response):
    data = await auth_service.exchange_google_session(payload.session_id)
    _set_session_cookie(response, data["session_token"])
    return {"user": data["user"], "expires_at": data["expires_at"]}


@router.post("/logout")
async def logout(
    response: Response,
    session_token: Optional[str] = Cookie(default=None),
):
    await auth_service.logout(session_token)
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@router.get("/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    from datetime import datetime

    created_at = user.get("created_at")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at)
        except ValueError:
            created_at = None
    if created_at and created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return UserPublic(**{**user, "created_at": created_at})


@router.patch("/me", response_model=UserPublic)
async def update_me(
    payload: ProfileUpdate, user: dict = Depends(get_current_user)
):
    from app.core.db import get_db

    updates = {
        k: v
        for k, v in payload.model_dump(exclude_unset=True).items()
        if v is not None
    }
    if not updates:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="No changes provided."
        )
    db = get_db()
    await db.users.update_one(
        {"user_id": user["user_id"]}, {"$set": updates}
    )
    updated = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return UserPublic(**updated)
