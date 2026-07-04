"""Hospital service — search, detail, compare, Value Score.

All hospitals live in MongoDB collection ``hospitals`` and are seeded on startup
from :mod:`app.services.hospital_seed`. The service exposes typed helpers for
querying, filtering, sorting and comparing hospitals.
"""
from __future__ import annotations

import math
from typing import List, Optional, Sequence

from app.core.db import get_db
from app.schemas.hospital import Hospital


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0088
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(a))


async def list_hospitals(
    *,
    query: Optional[str] = None,
    city: Optional[str] = None,
    tier: Optional[str] = None,
    specialty: Optional[str] = None,
    min_value_score: Optional[int] = None,
    max_price_typical: Optional[int] = None,
    limit: int = 100,
) -> List[Hospital]:
    db = get_db()
    mongo_query: dict = {}
    if city:
        mongo_query["city"] = {"$regex": f"^{city}$", "$options": "i"}
    if tier:
        mongo_query["tier"] = tier
    if specialty:
        mongo_query["specialties"] = {"$regex": specialty, "$options": "i"}
    if min_value_score is not None:
        mongo_query["value_score.overall"] = {"$gte": int(min_value_score)}
    if query:
        mongo_query["$or"] = [
            {"name": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"specialties": {"$regex": query, "$options": "i"}},
            {"city": {"$regex": query, "$options": "i"}},
        ]

    cursor = db.hospitals.find(mongo_query, {"_id": 0}).limit(limit)
    docs = await cursor.to_list(length=limit)

    if max_price_typical is not None:
        docs = [
            d
            for d in docs
            if any(
                (p.get("typical_inr") or 0) <= max_price_typical
                for p in (d.get("pricing") or [])
            )
        ]

    docs.sort(key=lambda d: -int(d.get("value_score", {}).get("overall", 0)))
    return [Hospital(**d) for d in docs]


async def get_hospital(hospital_id: str) -> Optional[Hospital]:
    db = get_db()
    doc = await db.hospitals.find_one({"id": hospital_id}, {"_id": 0})
    return Hospital(**doc) if doc else None


async def compare_hospitals(hospital_ids: Sequence[str]) -> List[Hospital]:
    if not hospital_ids:
        return []
    db = get_db()
    cursor = db.hospitals.find(
        {"id": {"$in": list(hospital_ids)}},
        {"_id": 0},
    )
    docs = await cursor.to_list(length=len(hospital_ids))
    # Preserve requested order
    order = {hid: i for i, hid in enumerate(hospital_ids)}
    docs.sort(key=lambda d: order.get(d["id"], 99))
    return [Hospital(**d) for d in docs]


async def cities() -> List[str]:
    db = get_db()
    values = await db.hospitals.distinct("city")
    return sorted([v for v in values if v])


async def specialties() -> List[str]:
    db = get_db()
    values = await db.hospitals.distinct("specialties")
    return sorted({v for v in values if v})


async def nearest_hospitals(
    *,
    latitude: float,
    longitude: float,
    limit: int = 8,
    specialty: Optional[str] = None,
    emergency_only: bool = True,
) -> List[dict]:
    """Return nearest hospitals with distance in km."""
    db = get_db()
    query: dict = {}
    if emergency_only:
        query["emergency_247"] = True
    if specialty:
        query["specialties"] = {"$regex": specialty, "$options": "i"}
    docs = await db.hospitals.find(query, {"_id": 0}).to_list(length=500)

    with_dist = []
    for d in docs:
        km = _haversine_km(latitude, longitude, d["latitude"], d["longitude"])
        with_dist.append({**d, "distance_km": round(km, 1)})
    with_dist.sort(key=lambda x: x["distance_km"])
    return with_dist[:limit]
