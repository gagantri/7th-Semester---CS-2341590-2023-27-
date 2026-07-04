"""User + auth schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

Role = Literal["patient", "professional", "hospital_admin", "platform_admin"]
AuthProvider = Literal["email", "google"]


class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")

    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: Role = "patient"
    auth_provider: AuthProvider = "email"
    default_city: Optional[str] = None
    language: str = "en"
    created_at: Optional[datetime] = None


class SignupPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=2, max_length=80)
    default_city: Optional[str] = None


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class LoginResult(BaseModel):
    user: UserPublic
    access_token: str
    token_type: Literal["Bearer"] = "Bearer"


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    default_city: Optional[str] = None
    language: Optional[str] = None
