"""AI router — Bill fraud detection + Cost estimator."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.ai_provider import AIProviderError
from app.schemas.ai import BillAnalysisResult, CostEstimateResult
from app.services import bill_analysis, cost_estimator

router = APIRouter(prefix="/ai", tags=["ai"])


class BillAnalyzeRequest(BaseModel):
    bill_text: str = Field(min_length=20, max_length=20000)
    hospital_name: Optional[str] = None
    city: Optional[str] = None
    hospital_tier: Optional[str] = None


class CostEstimateRequest(BaseModel):
    condition: str = Field(min_length=3, max_length=250)
    city: str = Field(min_length=2, max_length=80)
    hospital_tier: Optional[str] = None
    insurance: Optional[str] = None
    notes: Optional[str] = None


@router.post("/bill-analyze", response_model=BillAnalysisResult)
async def bill_analyze(payload: BillAnalyzeRequest):
    try:
        return await bill_analysis.analyze_bill(
            bill_text=payload.bill_text,
            hospital_name=payload.hospital_name,
            city=payload.city,
            hospital_tier=payload.hospital_tier,
        )
    except AIProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider error: {exc}",
        )


@router.post("/cost-estimate", response_model=CostEstimateResult)
async def cost_estimate(payload: CostEstimateRequest):
    try:
        return await cost_estimator.estimate_cost(
            condition=payload.condition,
            city=payload.city,
            hospital_tier=payload.hospital_tier,
            insurance=payload.insurance,
            notes=payload.notes,
        )
    except AIProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider error: {exc}",
        )
