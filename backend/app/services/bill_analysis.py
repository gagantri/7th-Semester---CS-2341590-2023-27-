"""Bill Fraud Detection service.

Accepts raw bill text (line items + prices), invokes the configured
``AIProvider``, and returns a structured ``BillAnalysisResult`` object.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional

from app.core.ai_provider import AIProvider, AIProviderError, get_ai_provider
from app.schemas.ai import BillAnalysisResult

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are GavixaCare Bill Auditor — an expert Indian medical
billing analyst with 20 years of hospital finance experience. Your job is to
protect patients from opaque or inflated hospital bills.

Context:
- Indian hospital bills often bundle: room rent, doctor visits, nursing charges,
  investigations (lab/radiology), consumables, medicines, procedures, ICU rent,
  and "miscellaneous" line items.
- Market rate benchmarks are your best-effort estimates for the given city and
  hospital tier. When uncertain, widen the range and mark confidence lower.
- You NEVER diagnose. You audit charges only.

Guidelines:
- Consider hospital tier (government/trust/private/premium) if provided.
- Flag common overcharge patterns: inflated consumables, duplicate line items,
  daily-rate mismatches (charged N days but stay was M days), missing itemisation.
- For every flag, give a plain-language explanation a lay patient can understand.
- Use INR integers only (no strings, no commas, no symbols) inside numeric fields.
"""


SCHEMA_HINT = """Return a JSON object with EXACTLY this schema. Keep responses concise (reasons under 25 words, questions under 20 words).
{
  "summary": {
    "total_billed_inr": integer,
    "estimated_fair_inr": integer,
    "potential_overcharge_inr": integer,
    "overcharge_percent": number,
    "hospital_name": string|null,
    "city": string|null,
    "hospital_tier": "government"|"trust"|"private"|"premium"|"unknown"
  },
  "line_items": [
    {
      "description": string,
      "billed_amount_inr": integer,
      "fair_amount_inr": integer,
      "variance_inr": integer,
      "variance_percent": number,
      "flag": "ok"|"watch"|"suspect"|"overcharge",
      "reason": string
    }
  ],
  "flags": [
    {
      "code": string,
      "severity": "info"|"warning"|"critical",
      "title": string,
      "explanation": string,
      "evidence": string
    }
  ],
  "questions_to_ask": [string],
  "next_steps": [string],
  "confidence": "low"|"medium"|"high",
  "caveats": [string]
}
Rules:
- Cover EVERY distinct billed line in `line_items` (keep reasons under 25 words).
- Maximum 6 `flags` (highest severity only) and maximum 6 `next_steps`.
- 3-6 `questions_to_ask`; 2-5 `caveats`.
- Keep each string field concise. Do not repeat information across sections.
"""


def _build_user_prompt(
    *,
    bill_text: str,
    hospital_name: Optional[str],
    city: Optional[str],
    hospital_tier: Optional[str],
) -> str:
    meta_lines = []
    if hospital_name:
        meta_lines.append(f"Hospital: {hospital_name}")
    if city:
        meta_lines.append(f"City: {city}")
    if hospital_tier:
        meta_lines.append(f"Tier: {hospital_tier}")
    meta = "\n".join(meta_lines) or "(No hospital metadata provided)"

    return (
        f"Analyse this Indian hospital bill.\n\n{meta}\n\n"
        f"BILL TEXT:\n---\n{bill_text}\n---\n\n{SCHEMA_HINT}"
    )


async def analyze_bill(
    *,
    bill_text: str,
    hospital_name: Optional[str] = None,
    city: Optional[str] = None,
    hospital_tier: Optional[str] = None,
    provider: Optional[AIProvider] = None,
) -> BillAnalysisResult:
    """Run the AI bill audit and return a validated ``BillAnalysisResult``."""
    if not bill_text or len(bill_text.strip()) < 20:
        raise ValueError("Bill text is too short to analyse.")

    provider = provider or get_ai_provider()
    user_prompt = _build_user_prompt(
        bill_text=bill_text,
        hospital_name=hospital_name,
        city=city,
        hospital_tier=hospital_tier,
    )

    try:
        data: Dict[str, Any] = await provider.generate_json(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            max_tokens=8000,
        )
    except AIProviderError:
        raise

    # Attach source hospital metadata if the model omitted it
    summary = data.get("summary") or {}
    if hospital_name and not summary.get("hospital_name"):
        summary["hospital_name"] = hospital_name
    if city and not summary.get("city"):
        summary["city"] = city
    data["summary"] = summary

    logger.info(
        "Bill analysis complete: %s line items, confidence=%s",
        len(data.get("line_items", []) or []),
        data.get("confidence"),
    )

    try:
        return BillAnalysisResult(**data)
    except Exception as exc:
        # Include a short debug hint but never leak the whole raw payload.
        raise AIProviderError(
            f"Schema validation failed for bill analysis: {exc}. "
            f"Received keys={list(data.keys())}"
        ) from exc


def pretty_result(result: BillAnalysisResult) -> str:
    return json.dumps(result.model_dump(), indent=2, ensure_ascii=False)
