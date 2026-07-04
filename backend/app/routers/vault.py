"""Vault router (user-scoped health records)."""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.schemas.vault import VaultDocument, VaultUploadPayload
from app.services import vault_service

router = APIRouter(prefix="/vault", tags=["vault"])


@router.post("/documents", response_model=VaultDocument)
async def upload(
    payload: VaultUploadPayload, user: dict = Depends(get_current_user)
):
    return await vault_service.upload_document(user["user_id"], payload)


@router.get("/documents", response_model=List[VaultDocument])
async def list_docs(
    doc_type: Optional[str] = None,
    for_member: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    return await vault_service.list_documents(
        user["user_id"], doc_type=doc_type, for_member=for_member
    )


@router.get("/documents/{doc_id}", response_model=VaultDocument)
async def get_doc(doc_id: str, user: dict = Depends(get_current_user)):
    return await vault_service.get_document(user["user_id"], doc_id)


@router.delete("/documents/{doc_id}")
async def delete_doc(doc_id: str, user: dict = Depends(get_current_user)):
    await vault_service.delete_document(user["user_id"], doc_id)
    return {"ok": True}
