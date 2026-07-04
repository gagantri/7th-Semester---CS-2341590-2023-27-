# GavixaCare — Product Requirements Document (PRD)

> **Version:** 1.0 · **Status:** MVP Live · **Owner:** Product
> **Parent brand:** Gavixa · **Tagline:** "Clarity in Healthcare. Confidence in Every Decision."

---

## 1. Vision & Mission

**Mission:** Give every Indian family the price transparency, AI bill audits, and emergency navigation that the healthcare system does not offer today.

**Vision:** A future where no Indian family is financially destroyed by a medical event they could not predict or prepare for.

**Positioning:** *The only healthcare platform that works for the patient, not the hospital.*

---

## 2. Problem Statement

- ₹5.6 Lakh Crore Indian healthcare market (2024)
- **340M+** patients treated annually
- **70%** of costs are out-of-pocket
- **Only 37%** have health insurance
- **60–70%** of hospital bills contain inflated charges
- Zero real-time hospital pricing transparency for consumers
- ABDM + DPDP compliance not integrated with consumer tooling

Our users experience healthcare through five painful moments: (1) picking a hospital, (2) estimating cost before admission, (3) hospitalisation itself, (4) receiving and disputing the bill, (5) emergencies with no time to research.

---

## 3. Personas

### P1 · Middle-class metro parent (Anjali, 42, Delhi NCR)
Just learned her father needs cardiac surgery. Has ₹5L cover. Trusts government hospitals but wants a private option with a fair price. Uses WhatsApp + Google Maps daily. Reads Hindi + English.

### P2 · Tier-2 breadwinner (Rakesh, 38, Lucknow)
Owns a small shop. No health insurance. Just paid ₹4L for wife's C-section and suspects overcharging. Uses a ₹8K Android phone; data plan is small. Prefers Hindi UI.

### P3 · NRI daughter caring remotely (Priya, 34, Bengaluru → Chicago)
Coordinating parents' healthcare from abroad. Needs to compare hospitals, book appointments, and audit bills for her retired parents in Chennai.

### P4 · Doctor referrer (Dr. Verma, 51, Mumbai)
General physician. Wants a trusted tool to share with patients. Never wants to look opaque himself.

### P5 · Insurance TPA analyst (Rohit, 29, Gurugram)
Processes claims. Wants an AI second-opinion on suspiciously large bills to flag before payout.

### P6 · Rural user via WhatsApp (Ramesh, 55, MP village)
Has smartphone but limited data. Only uses WhatsApp. Emergency = messages the platform's WhatsApp bot for the nearest 108-connected hospital.

### P7 · Journalist/Regulator (Sushmita, 38, Delhi)
Covers healthcare. Wants aggregate pricing data for policy stories.

---

## 4. Feature Scope

### Phase 1 (LIVE in MVP)
1. **Hospital Compare & Directory** — 32 seeded hospitals across 11 cities; search + filters (city, tier, specialty); side-by-side compare; Value Score algorithm (Price 35% · Quality 40% · Availability 15% · Trust 10%).
2. **AI Bill Fraud Detector** — Claude Sonnet 4.5-powered line-item analysis with confidence scoring, dispute questions, and next-step guidance.
3. **AI Cost Estimator** — City + tier + insurance-aware cost ranges with itemised breakdown, cost drivers, savings tips, and questions to ask.
4. **Emergency Hospital Finder** — GPS-based nearest 24×7 hospitals, distance in km, one-tap 108/112 dial, 7 public helplines, offline-safe fallback.
5. **Health Records Vault** — Encrypted user-scoped document store (lab reports, prescriptions, discharge summaries, imaging, bills). Base64 in MVP; S3-ready.
6. **Auth** — Email/password JWT + Emergent-managed Google OAuth (session cookie).
7. **Design system** — Light/dark themes, mobile-first responsive, WCAG AA, Apple Health + Stripe + Linear aesthetic.

### Phase 2 (Next 90 days)
- Doctor Directory + appointment booking
- Family Health Profiles (up to 6 members)
- Preventive Health Package Comparator
- Insurance Coverage Analyzer (PMJAY / CGHS / ECHS / private)
- WhatsApp Bill Bot (Twilio / MSG91)
- ABHA ID linking (ABDM)

### Phase 3 (6–12 months)
- Hospital SaaS dashboard (self-serve listing + pricing update)
- Government B2G analytics dashboard
- Insurance Partner API (per-query fraud scoring)
- Voice interface (Hindi + 4 regional languages)
- Predictive bed availability model
- Full ABDM certification

### Phase 4 (12–24 months)
- International expansion (Sri Lanka, Bangladesh, Nepal)
- Medical tourism module
- Chronic disease management
- Community Q&A with verified doctors

---

## 5. Success Metrics (North Star)

| Metric | 6-month target | 12-month target |
|---|---|---|
| Monthly Active Users | 100,000 | 1,000,000 |
| Bill audits run / month | 5,000 | 100,000 |
| Verified hospitals | 500 | 2,500 |
| Cities covered | 20 | 50 |
| Freemium → Paid conversion | 3% | 5% |
| ARR | ₹1.5 Cr | ₹18 Cr |
| Data freshness (verified in 30 days) | 70% | 90% |

---

## 6. AI Safety & Ethics Guardrails

- All AI outputs carry `confidence` (low / medium / high) and `caveats`.
- AI never diagnoses; symptom triage (Phase 2) will only route to specialist type.
- Bill fraud flags show variance %, evidence, and are never framed as absolute accusations.
- All recommendations include a "consult a qualified doctor" disclaimer where clinical.
- Bias review quarterly across demographic groups.

---

## 7. Data Strategy

- **MVP:** 32 curated hospitals with realistic tiered pricing (government / trust / private / premium templates).
- **Growth:** City-manager data ops team upserts real pricing quarterly.
- **Scale:** Hospital SaaS lets admins self-service; ABDM HFR sync when available.
- **Verification:** Each hospital record shows `last_updated` and confidence signal.
- **Dispute flow:** hospitals can contest a listed price → data ops review within 48h.

---

## 8. Legal & Compliance

- **DPDP Act 2023** — Data Fiduciary status; consent management framework; Data Protection Officer; right-to-erasure endpoint.
- **ABDM** — ABHA ID linking, Health Facility Registry, Healthcare Professional Registry (Phase 2).
- **NMC** — Doctor verification via NMC registry (Phase 2).
- **IRDAI** — Compliance required for any insurance recommendation.
- **IT Rules 2021** — Grievance officer, 72-hour breach reporting.
- **Medical Council ethics** — No advertising of specific doctors; neutral comparisons only.
- **Consumer Protection Act 2019** — Platform disclaims responsibility for third-party pricing accuracy while committing to good-faith curation.

---

## 9. Non-Goals (What we deliberately do not do)

- We do **not** provide medical diagnoses.
- We do **not** guarantee any specific price.
- We do **not** sell user data to hospitals or advertisers.
- We do **not** publish public leaderboards naming specific hospitals as "worst offenders" (legal risk); instead, we publish city/tier aggregates.
