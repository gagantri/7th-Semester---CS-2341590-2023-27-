"""Vault schemas (health records)."""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

DocType = Literal[
    "lab_report", "prescription", "discharge_summary", "imaging", "bill", "other"
]


class VaultDocument(BaseModel):
    model_config = ConfigDict(extra="ignore")

    doc_id: str
    user_id: str
    title: str
    doc_type: DocType
    file_name: str
    mime_type: str
    size_bytes: int
    content_base64: Optional[str] = None  # Only returned on detail fetch
    for_member: Optional[str] = None  # Family member label
    tags: list[str] = Field(default_factory=list)
    notes: str = ""
    created_at: datetime


class VaultUploadPayload(BaseModel):
    title: str
    doc_type: DocType
    file_name: str
    mime_type: str
    content_base64: str
    for_member: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    notes: str = ""
