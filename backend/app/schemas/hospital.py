"""Hospital schemas."""
from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

HospitalTier = Literal["government", "trust", "private", "premium"]


class PriceItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    procedure: str
    low_inr: int
    typical_inr: int
    high_inr: int
    notes: str = ""


class BedAvailability(BaseModel):
    model_config = ConfigDict(extra="ignore")

    total_beds: int
    icu_beds: int
    free_general_beds: int
    free_icu_beds: int
    last_updated: str  # ISO date string


class ValueScore(BaseModel):
    model_config = ConfigDict(extra="ignore")

    overall: int  # 0-100
    price: int
    quality: int
    availability: int
    trust: int


class Hospital(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    city: str
    address: str
    tier: HospitalTier
    specialties: List[str] = Field(default_factory=list)
    accreditation: List[str] = Field(default_factory=list)
    rating: float
    review_count: int
    latitude: float
    longitude: float
    phone: str
    emergency_247: bool = True
    value_score: ValueScore
    beds: BedAvailability
    pricing: List[PriceItem] = Field(default_factory=list)
    photo_url: Optional[str] = None
    established_year: Optional[int] = None
    description: str = ""
