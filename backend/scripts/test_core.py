"""Core POC: validate that Claude Sonnet 4.5 can power the two AI flows.

Runs two isolated tests end-to-end:
  1. Bill Fraud Detection on a realistic Indian hospital bill.
  2. Cost Estimator for a common procedure across two Indian cities.

Exit code:
  * 0 if both tests pass schema validation and sanity checks.
  * 1 otherwise.

Usage (from /app):
  cd /app/backend && PYTHONPATH=. python scripts/test_core.py
"""
from __future__ import annotations

import asyncio
import json
import sys
import traceback
from pathlib import Path

# Ensure `app` package is importable when running as a script
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.bill_analysis import analyze_bill, pretty_result as pretty_bill
from app.services.cost_estimator import estimate_cost, pretty_result as pretty_cost


SAMPLE_BILL = """APOLLO HOSPITAL, DELHI
PATIENT: Ramesh Kumar (M, 54)
ADMISSION: 12-Mar-2026 to 17-Mar-2026 (5 nights)
DIAGNOSIS: Laparoscopic Appendectomy
---------------------------------------------
ITEM                              QTY   AMOUNT (INR)
---------------------------------------------
General Ward Room Rent            5     45,000
ICU Charges (post-op)             2     72,000
Surgeon Fee - Appendectomy        1     85,000
Anaesthesia                       1     35,000
OT Charges                        1     42,000
Consumables (surgical)            1     58,000
Laparoscopic Instruments Kit      1     46,000
Nursing Charges                   5     18,500
Physiotherapy (post-op)           2     14,000
Diagnostics (CBC, LFT, KFT)       3     11,200
Ultrasound Abdomen                1      3,800
ECG                               2      2,400
X-Ray Chest                       1      1,400
Medicines (as per pharmacy bill)  -     28,600
IV Fluids and Injectables         -     14,300
Doctor Visits (Consultant)        6     18,000
Doctor Visits (Registrar)         8      9,600
Dietician Consultation            2      3,200
Biomedical Waste Charges          5      2,500
Registration & Admission Fee      1      2,000
Discharge Summary                 1      1,500
Miscellaneous Charges             -     12,400
---------------------------------------------
TOTAL                                   5,26,400
"""


async def run_bill_test() -> bool:
    print("\n" + "=" * 70)
    print("TEST 1: Bill Fraud Detection")
    print("=" * 70)
    try:
        result = await analyze_bill(
            bill_text=SAMPLE_BILL,
            hospital_name="Apollo Hospital, Delhi",
            city="Delhi",
            hospital_tier="private",
        )
    except Exception as exc:
        print(f"\u274c FAILED with exception: {exc}")
        traceback.print_exc()
        return False

    # Sanity checks
    checks = {
        "summary_present": result.summary is not None,
        "line_items_non_empty": len(result.line_items) >= 5,
        "total_billed_positive": result.summary.total_billed_inr > 0,
        "confidence_set": result.confidence in {"low", "medium", "high"},
        "questions_non_empty": len(result.questions_to_ask) >= 2,
    }
    all_ok = all(checks.values())
    print(pretty_bill(result))
    print("\nChecks:", json.dumps(checks, indent=2))
    print("RESULT:", "\u2705 PASS" if all_ok else "\u274c FAIL")
    return all_ok


async def run_cost_test() -> bool:
    print("\n" + "=" * 70)
    print("TEST 2: Cost Estimator (Coronary Angiography, Mumbai, no insurance)")
    print("=" * 70)
    try:
        result = await estimate_cost(
            condition="Coronary Angiography (diagnostic)",
            city="Mumbai",
            hospital_tier="private",
            insurance="no insurance / cash payment",
            notes="Elective, patient is 58yo male, hypertensive",
        )
    except Exception as exc:
        print(f"\u274c FAILED with exception: {exc}")
        traceback.print_exc()
        return False

    checks = {
        "range_sane": (
            0 < result.estimate_inr.low
            <= result.estimate_inr.typical
            <= result.estimate_inr.high
        ),
        "breakdown_non_empty": len(result.breakdown) >= 5,
        "drivers_present": len(result.cost_drivers) >= 2,
        "questions_present": len(result.questions_to_ask) >= 3,
        "confidence_set": result.confidence in {"low", "medium", "high"},
    }
    all_ok = all(checks.values())
    print(pretty_cost(result))
    print("\nChecks:", json.dumps(checks, indent=2))
    print("RESULT:", "\u2705 PASS" if all_ok else "\u274c FAIL")
    return all_ok


async def main() -> int:
    bill_ok = await run_bill_test()
    cost_ok = await run_cost_test()
    print("\n" + "=" * 70)
    print(f"SUMMARY: bill_ok={bill_ok}, cost_ok={cost_ok}")
    print("=" * 70)
    return 0 if (bill_ok and cost_ok) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
