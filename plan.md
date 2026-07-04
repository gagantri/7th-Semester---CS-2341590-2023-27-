# GavixaCare — Plan (MVP → Enterprise Docs)

## 1) Objectives
- ✅ Prove the **core AI workflows** (AI bill analysis + AI cost estimation) work reliably via isolated POC scripts before UI.
- ✅ Build a **mobile-first, dark-mode, WCAG-AA** V1 web app for Phase-1 features: Hospital Directory/Compare, Bill Fraud Detector, Cost Estimator, Emergency Finder, Health Vault.
- ✅ Deliver a modular backend with **AIProvider abstraction** (Claude Sonnet 4.5 default) + API-ready services.
- ✅ Add authentication (Email/JWT + Emergent Google OAuth) and enforce user-scoped access for the Vault.
- ✅ Ship an initial **enterprise documentation package** in `/app/docs` aligned with the implemented system.
- 🔜 Extend the platform to Phase-2 patient features (Doctors, Family Profiles, Preventive Packages, WhatsApp Bot, Insurance Analyzer) without refactoring Phase-1.
- 🔜 Expand enterprise documentation (full legal docs drafts, GTM playbook, investor deck, 36-month financial model) and compliance implementation (DPDP/ABDM hardening).

---

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation: AI + Upload Parsing) ✅ *Completed*
**Focus:** Claude integration + consistent JSON outputs for downstream UI.

**Completed Steps**
1. ✅ Implemented `backend/app/core/ai_provider.py` with `AIProvider` interface + `ClaudeProvider` implementation.
2. ✅ Created `backend/scripts/test_core.py` with 2 runnable tests:
   - Bill fraud detection from **plain text**.
   - Cost estimator from (condition + city + insurance + hospital type).
3. ✅ Enforced strict response schemas (Pydantic):
   - `BillAnalysisResult` (summary, line-items, flags, confidence, caveats, questions, next steps).
   - `CostEstimateResult` (range, breakdown, drivers, confidence, caveats).
4. ✅ Added strict JSON extraction, retries for transient LLM proxy errors, and higher token budgets where required.
5. ✅ Tuned bill analysis prompt/schema to avoid ingress timeouts (kept output concise; ~30–40s typical).

**POC User Stories (Validated)**
1. ✅ Paste bill text → receive line-by-line overcharge flags with explanations.
2. ✅ Enter condition + city → get realistic range with itemized breakdown.
3. ✅ Confidence + caveats always present.
4. ✅ “Questions to ask the hospital” provided.
5. ✅ Provider abstraction supports future switching.

**Exit Criteria**
- ✅ `python backend/scripts/test_core.py` passes with schema-valid JSON for both flows.

---

### Phase 2 — V1 App Development (Phase-1 features) + 1st E2E test ✅ *Completed*
**Focus:** Working product flows end-to-end with seed data + excellent UX states.

**Backend (FastAPI) — Completed**
1. ✅ App skeleton: config, logging, CORS, OpenAPI, lifespan seeding.
2. ✅ Modules/services:
   - Hospitals: search/filter, detail, compare, nearest (haversine).
   - AI: `/ai/bill-analyze`, `/ai/cost-estimate` using proven POC logic.
   - Emergency: nearest hospitals + helplines.
   - Vault: document upload (base64) + list/detail/download/delete (S3-ready architecture).
3. ✅ Seed data: **32 hospitals** across **11 Indian cities** with pricing + bed counts + specialties.

**Frontend (React 19) — Completed**
1. ✅ Design system: Tailwind + shadcn/ui, brand tokens (navy/teal/orange), dark mode, typography (Inter + Mukta), tabular numerals.
2. ✅ App pages delivered:
   - Landing (SEO-ready), hospital directory, hospital detail, compare.
   - Bill analyzer (paste input → summary + line-item table + flags + questions/next steps).
   - Cost estimator (form → range + breakdown + drivers/tips/questions).
   - Emergency finder (explicit permission prompt → nearest list + 108/112 dial + helplines).
   - Health vault (upload/list/download/delete).
   - Settings/profile.
3. ✅ UX quality: skeletons, empty states, toasts, accessible focus rings, responsive bottom nav.
4. ✅ Testability: full `data-testid` registry (`/frontend/src/constants/testIds`).

**Testing — Completed**
- ✅ `testing_agent_v3`: validated Phase-1 flows end-to-end.
- ✅ 96% pass initially; **signup bug fixed**; verified to 100% on re-test.

**Exit Criteria**
- ✅ All 5 Phase-1 flows work end-to-end with no console errors and strong loading/empty/error states.

---

### Phase 3 — Auth + Hardening + 2nd E2E test ✅ *Completed (Auth shipped)*
**Focus:** Production readiness (auth, security, stability) without breaking V1.

**Completed Steps**
1. ✅ Email/Password + JWT auth (bcrypt hashing).
2. ✅ Emergent Google OAuth session flow implemented (cookie-based session_token).
3. ✅ Authorization rules:
   - ✅ Vault documents are user-scoped.
4. ✅ User settings/profile page added.
5. ✅ Seeded demo user for QA/testing.

**Remaining Hardening (Next Iteration)**
- 🔜 Refresh token rotation (or move JWT to httpOnly cookies).
- 🔜 Rate limiting / quotas for AI endpoints.
- 🔜 Audit logging for critical actions (login, vault access).
- 🔜 Saved analyses persistence (Phase 3.1 below).

**Testing**
- ✅ Auth flows tested via demo login; OAuth callback page exists (full Google login requires real account).

**Exit Criteria**
- ✅ Auth stable; vault isolation verified; no regressions in Phase-1 flows.

---

### Phase 3.1 — Persisted User History (Saved Analyses, Saved Comparisons) 🔜 *Next*
**Focus:** Make the MVP feel like a real product by persisting user value.

**Steps**
1. Add DB collections:
   - `bill_analyses` (user_id, created_at, input hash, result snapshot)
   - `cost_estimates` (user_id, created_at, request, result snapshot)
   - `saved_hospitals` / `saved_comparisons`
2. Add APIs:
   - `POST /ai/bill-analyze` optionally saves when authenticated (default save=true).
   - `GET /me/analyses`, `GET /me/estimates`, `GET /me/saved`.
3. Add Dashboard widgets:
   - Recent analyses, saved hospitals, saved comparisons.
4. Add privacy controls:
   - “Don’t save AI inputs/outputs” toggle.
   - Data deletion endpoint.

**Testing**
- Run `testing_agent_v3`: create analysis → verify it appears in history and is user-scoped.

---

### Phase 4 — Phase-2 Features + 3rd E2E test 🔜
**Focus:** Extend modularly without refactoring core.

**Steps**
1. Doctor directory + appointment request (MVP: request + confirmation, no payments).
2. Family profiles (MVP: dependents + document tagging).
3. Preventive package comparator (seed data, filters, transparency score).
4. WhatsApp bot integration (MVP: webhook-ready + deep links into web app).
5. Insurance coverage analyzer (MVP: rule-based + AI explanation layer).
6. Architecture hooks for ABHA login + ABDM HFR integration.

**Phase 4 User Stories**
1. Find doctors by specialty/city and request an appointment.
2. Create family profiles and tag documents to each person.
3. Compare preventive packages by inclusions and price.
4. Start flows from WhatsApp and continue on the web.
5. Understand what insurance likely covers with clear caveats.

**Testing**
- Run `testing_agent_v3`: new feature flows + regression.

---

### Phase 5 — Enterprise Documentation Package (in `/app/docs`) 🟡 *Partially Completed*
**Completed Docs (delivered)**
- ✅ `PRD.md`
- ✅ `ARCHITECTURE.md`
- ✅ `BRAND.md`
- ✅ `API.md`
- ✅ `BUSINESS_MODEL.md`
- ✅ `LEGAL_COMPLIANCE.md`
- ✅ `MVP_DELIVERY.md`

**Remaining Docs (Next Iteration)**
- 🔜 BRD (Business Requirements Document)
- 🔜 Full Privacy Policy + Terms of Service + Medical Disclaimer (publish-ready)
- 🔜 GTM playbook (channels, partnerships, city rollout)
- 🔜 Investor pitch deck (12 slides)
- 🔜 36-month financial model (3 scenarios)
- 🔜 Security  threat model + VAPT plan
- 🔜 Operational runbooks (oncall, incident response, data disputes)

---

## 3) Next Actions (Immediate)
1. Implement **Phase 3.1**: persisted user history for AI analyses + saved hospitals/comparisons.
2. Add **rate limiting + quotas** to AI endpoints; add analytics counters.
3. Draft remaining enterprise docs (BRD, legal publish-ready, GTM, investor deck, financial model).
4. Begin Phase 4 modules (Doctors, Family, Preventive, WhatsApp, Insurance) behind feature flags.

---

## 4) Success Criteria
- ✅ POC: schema-valid Claude outputs for bill analysis + cost estimation across multiple inputs.
- ✅ V1: all 5 Phase-1 user flows complete end-to-end on mobile and desktop in light/dark modes.
- ✅ Reliability: robust loading/empty/error states; no console errors.
- ✅ Security baseline: vault user isolation post-auth.
- 🟡 Production hardening: rate limiting, abuse prevention, refresh token strategy.
- 🟡 Product stickiness: saved analysis history + saved comparisons.
- 🟡 Documentation: enterprise docs in `/app/docs` aligned with implemented system; remaining docs queued.
