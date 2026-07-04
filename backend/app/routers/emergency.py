"""Emergency router."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Query

from app.services import hospital_service

router = APIRouter(prefix="/emergency", tags=["emergency"])


@router.get("/nearest")
async def nearest(
    lat: float = Query(...),
    lng: float = Query(...),
    specialty: Optional[str] = None,
    limit: int = Query(8, ge=1, le=20),
):
    hospitals = await hospital_service.nearest_hospitals(
        latitude=lat, longitude=lng, limit=limit, specialty=specialty
    )
    return {
        "hospitals": hospitals,
        "helplines": {
            "national_emergency": "112",
            "ambulance_national": "108",
            "medical_helpline": "102",
            "women_helpline": "1091",
            "child_helpline": "1098",
            "blood_bank": "1910",
            "poison_control": "1066",
        },
    }
