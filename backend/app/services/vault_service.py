"""Vault service (health documents) — user-scoped."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException, status

from app.core.db import get_db
from app.schemas.vault import VaultDocument, VaultUploadPayload

MAX_SIZE_BYTES = 8 * 1024 * 1024  # 8 MB


async def upload_document(user_id: str, payload: VaultUploadPayload) -> VaultDocument:
    # Rough size guard — base64 is ~1.37x binary
    approx_bytes = int(len(payload.content_base64) * 3 / 4)
    if approx_bytes > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds 8MB limit.",
        )
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    doc = {
        "doc_id": doc_id,
        "user_id": user_id,
        "title": payload.title,
        "doc_type": payload.doc_type,
        "file_name": payload.file_name,
        "mime_type": payload.mime_type,
        "size_bytes": approx_bytes,
        "content_base64": payload.content_base64,
        "for_member": payload.for_member,
        "tags": payload.tags,
        "notes": payload.notes,
        "created_at": now.isoformat(),
    }
    db = get_db()
    await db.vault_documents.insert_one(doc)
    doc_out = {**doc, "created_at": now, "content_base64": None}
    return VaultDocument(**doc_out)


def _to_public(doc: dict, *, include_content: bool = False) -> VaultDocument:
    created_at = doc.get("created_at")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at)
        except ValueError:
            created_at = datetime.now(timezone.utc)
    return VaultDocument(
        **{
            **doc,
            "created_at": created_at,
            "content_base64": doc.get("content_base64") if include_content else None,
        }
    )


async def list_documents(
    user_id: str,
    *,
    doc_type: Optional[str] = None,
    for_member: Optional[str] = None,
) -> List[VaultDocument]:
    db = get_db()
    query: dict = {"user_id": user_id}
    if doc_type:
        query["doc_type"] = doc_type
    if for_member:
        query["for_member"] = for_member
    docs = await db.vault_documents.find(query, {"_id": 0}).to_list(length=500)
    docs.sort(key=lambda d: d.get("created_at", ""), reverse=True)
    return [_to_public(d, include_content=False) for d in docs]


async def get_document(user_id: str, doc_id: str) -> VaultDocument:
    db = get_db()
    doc = await db.vault_documents.find_one(
        {"user_id": user_id, "doc_id": doc_id}, {"_id": 0}
    )
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found."
        )
    return _to_public(doc, include_content=True)


async def delete_document(user_id: str, doc_id: str) -> None:
    db = get_db()
    result = await db.vault_documents.delete_one(
        {"user_id": user_id, "doc_id": doc_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found."
        )
