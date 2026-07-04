"""Hospital router."""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.hospital import Hospital
from app.services import hospital_service

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.get("", response_model=List[Hospital])
async def list_hospitals(
    query: Optional[str] = None,
    city: Optional[str] = None,
    tier: Optional[str] = None,
    specialty: Optional[str] = None,
    min_value_score: Optional[int] = None,
    max_price_typical: Optional[int] = None,
    limit: int = Query(100, ge=1, le=200),
):
    return await hospital_service.list_hospitals(
        query=query,
        city=city,
        tier=tier,
        specialty=specialty,
        min_value_score=min_value_score,
        max_price_typical=max_price_typical,
        limit=limit,
    )


@router.get("/facets")
async def facets():
    return {
        "cities": await hospital_service.cities(),
        "specialties": await hospital_service.specialties(),
        "tiers": ["government", "trust", "private", "premium"],
    }


@router.get("/compare", response_model=List[Hospital])
async def compare(ids: str = Query(..., description="Comma-separated hospital ids")):
    hospital_ids = [x.strip() for x in ids.split(",") if x.strip()]
    if not (2 <= len(hospital_ids) <= 4):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compare 2\u20134 hospitals.",
        )
    return await hospital_service.compare_hospitals(hospital_ids)


@router.get("/{hospital_id}", response_model=Hospital)
async def get_hospital(hospital_id: str):
    hosp = await hospital_service.get_hospital(hospital_id)
    if not hosp:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Hospital not found.")
    return hosp
