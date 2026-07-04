"""Pydantic schemas for AI service outputs."""
from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

Confidence = Literal["low", "medium", "high"]
HospitalTier = Literal["government", "trust", "private", "premium", "unknown", "any"]
LineFlag = Literal["ok", "watch", "suspect", "overcharge"]
FlagSeverity = Literal["info", "warning", "critical"]


class BillLineItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    description: str
    billed_amount_inr: int
    fair_amount_inr: int
    variance_inr: int
    variance_percent: float
    flag: LineFlag
    reason: str


class BillFlag(BaseModel):
    model_config = ConfigDict(extra="ignore")

    code: str
    severity: FlagSeverity
    title: str
    explanation: str
    evidence: str = ""


class BillSummary(BaseModel):
    model_config = ConfigDict(extra="ignore")

    total_billed_inr: int
    estimated_fair_inr: int
    potential_overcharge_inr: int
    overcharge_percent: float
    hospital_name: Optional[str] = None
    city: Optional[str] = None
    hospital_tier: HospitalTier = "unknown"


class BillAnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    summary: BillSummary
    line_items: List[BillLineItem] = Field(default_factory=list)
    flags: List[BillFlag] = Field(default_factory=list)
    questions_to_ask: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    confidence: Confidence = "medium"
    caveats: List[str] = Field(default_factory=list)


# ---------- Cost estimator ----------


class CostRange(BaseModel):
    model_config = ConfigDict(extra="ignore")

    low: int
    typical: int
    high: int


class CostBreakdownItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    category: str
    low_inr: int
    typical_inr: int
    high_inr: int
    notes: str = ""


class CostEstimateResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    condition: str
    city: str
    hospital_tier: HospitalTier = "any"
    insurance_context: str
    estimate_inr: CostRange
    out_of_pocket_inr: Optional[CostRange] = None
    breakdown: List[CostBreakdownItem] = Field(default_factory=list)
    cost_drivers: List[str] = Field(default_factory=list)
    savings_tips: List[str] = Field(default_factory=list)
    questions_to_ask: List[str] = Field(default_factory=list)
    expected_stay_days: float = 0
    confidence: Confidence = "medium"
    caveats: List[str] = Field(default_factory=list)
