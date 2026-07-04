"""AI Treatment Cost Estimator service.

Given a medical condition, city, hospital tier and insurance context, returns
a structured ``CostEstimateResult`` with a realistic INR range, itemised
breakdown and confidence + caveats.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional

from app.core.ai_provider import AIProvider, AIProviderError, get_ai_provider
from app.schemas.ai import CostEstimateResult

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are GavixaCare Cost Navigator — an expert on Indian
healthcare procedure pricing across tiers (government, trust, private,
premium) and cities. You produce transparent, itemised cost ranges to help
patients plan and negotiate. You never guarantee outcomes and always include
appropriate medical caveats.

Guidelines:
- Ranges must be realistic and city-adjusted.
- Break down cost drivers: consultations, investigations, procedure/surgeon,
  anaesthesia, room rent (per-day × typical stay), ICU (if applicable),
  consumables/implants, medicines, follow-up.
- If insurance context is provided, estimate the out-of-pocket range too.
- Highlight what changes the cost most (drivers).
- Provide 3–5 questions patients should ask before admission.
- Use INR integers only (no strings, no commas, no symbols) inside numeric fields.
"""


SCHEMA_HINT = """Return a JSON object with EXACTLY this schema:
{
  "condition": string,
  "city": string,
  "hospital_tier": "government"|"trust"|"private"|"premium"|"any",
  "insurance_context": string,
  "estimate_inr": {
    "low": integer,
    "typical": integer,
    "high": integer
  },
  "out_of_pocket_inr": {
    "low": integer,
    "typical": integer,
    "high": integer
  }|null,
  "breakdown": [
    {
      "category": string,
      "low_inr": integer,
      "typical_inr": integer,
      "high_inr": integer,
      "notes": string
    }
  ],
  "cost_drivers": [string],
  "savings_tips": [string],
  "questions_to_ask": [string],
  "expected_stay_days": number,
  "confidence": "low"|"medium"|"high",
  "caveats": [string]
}
The `breakdown` array MUST contain at least 5 categories.
"""


def _build_user_prompt(
    *,
    condition: str,
    city: str,
    hospital_tier: Optional[str],
    insurance: Optional[str],
    notes: Optional[str],
) -> str:
    tier = hospital_tier or "any"
    insurance_ctx = insurance or "no insurance / cash payment"
    extra = f"Additional notes: {notes}\n" if notes else ""
    return (
        f"Estimate the treatment cost in India for the following case.\n\n"
        f"Condition/Procedure: {condition}\n"
        f"City: {city}\n"
        f"Hospital tier: {tier}\n"
        f"Insurance: {insurance_ctx}\n"
        f"{extra}\n{SCHEMA_HINT}"
    )


async def estimate_cost(
    *,
    condition: str,
    city: str,
    hospital_tier: Optional[str] = None,
    insurance: Optional[str] = None,
    notes: Optional[str] = None,
    provider: Optional[AIProvider] = None,
) -> CostEstimateResult:
    """Run the AI cost estimator and return a validated ``CostEstimateResult``."""
    if not condition or not city:
        raise ValueError("condition and city are required.")

    provider = provider or get_ai_provider()
    user_prompt = _build_user_prompt(
        condition=condition,
        city=city,
        hospital_tier=hospital_tier,
        insurance=insurance,
        notes=notes,
    )

    data: Dict[str, Any] = await provider.generate_json(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        max_tokens=3500,
    )

    # Backfill echo fields if missing
    data.setdefault("condition", condition)
    data.setdefault("city", city)
    data.setdefault("hospital_tier", hospital_tier or "any")
    data.setdefault(
        "insurance_context", insurance or "no insurance / cash payment"
    )

    logger.info(
        "Cost estimate: %s @ %s, confidence=%s",
        condition,
        city,
        data.get("confidence"),
    )

    try:
        return CostEstimateResult(**data)
    except Exception as exc:
        raise AIProviderError(
            f"Schema validation failed for cost estimate: {exc}. "
            f"Received keys={list(data.keys())}"
        ) from exc


def pretty_result(result: CostEstimateResult) -> str:
    return json.dumps(result.model_dump(), indent=2, ensure_ascii=False)
