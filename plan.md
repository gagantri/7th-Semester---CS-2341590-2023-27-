# GavixaCare — Plan (MVP → Enterprise Docs)

## 1) Objectives
- Prove the **core workflows** (AI bill analysis + AI cost estimation) work reliably via isolated POC scripts before UI.
- Build a **mobile-first, dark-mode, WCAG-AA** V1 web app for Phase-1 features: Hospital Directory/Compare, Bill Fraud Detector, Cost Estimator, Emergency Finder, Health Vault.
- Deliver a modular backend with **AIProvider abstraction** (Claude Sonnet 4.5 default) + API-ready services.
- Add authentication (Email/JWT + Google OAuth) after core workflows are stable.
- Ship a complete **enterprise documentation package** in `/app/docs`.

---

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation: AI + Upload Parsing) ✅ *Do not proceed until stable*
**Focus:** Claude integration + consistent JSON outputs for downstream UI.

**Steps**
1. Web research: Anthropic/Claude best practices for structured JSON output, prompt patterns, safety disclaimers for healthcare.
2. Implement `backend/app/core/ai_provider.py` with `AIProvider` interface + `ClaudeProvider` implementation.
3. Create `backend/scripts/test_core.py` with 2 runnable tests:
   - Bill fraud detection from **plain text** (later extend to OCR).
   - Cost estimator from (condition + city + insurance + hospital type).
4. Enforce strict response schemas (Pydantic):
   - `BillAnalysisResult` (line-items, flags, confidence, rationale, suggested questions).
   - `CostEstimateResult` (range, breakdown, drivers, confidence, caveats).
5. Iterate prompts + parsing until:
   - JSON is valid every run.
   - Outputs are useful and consistent.

**POC User Stories**
1. As a patient, I can paste bill text and receive line-by-line overcharge flags with explanations.
2. As a patient, I can enter condition + city and get a realistic range with an itemized breakdown.
3. As a user, I always see confidence + caveats so I understand uncertainty.
4. As a user, I get a short “questions to ask the hospital” list after analysis.
5. As a developer, I can switch AI providers without touching business logic.

**Exit Criteria**
- `python backend/scripts/test_core.py` passes with deterministic, schema-valid JSON for both flows.

---

### Phase 2 — V1 App Development (Phase-1 features, **no auth yet**) + 1st E2E test
**Focus:** Working product flows end-to-end with seed data + excellent UX states.

**Backend (FastAPI)**
1. App skeleton: config, logging, error model, rate limiting basics, CORS, OpenAPI.
2. Modules/services:
   - Hospitals: search/filter, detail, compare, Value Score.
   - AI: `/ai/bill-analyze`, `/ai/cost-estimate` using proven POC logic.
   - Emergency: nearest hospital (mock geo + fallback city search).
   - Vault: document upload (base64) + list/download/delete (S3-ready abstraction).
3. Seed data: 30+ hospitals across major cities + pricing + bed counts + specialties.

**Frontend (React)**
1. Design system: Tailwind + shadcn/ui, brand tokens (navy/teal), dark mode, typography.
2. App pages:
   - Marketing landing (SEO), directory, hospital detail, compare.
   - Bill fraud detector (upload/paste → results table).
   - Cost estimator (form → estimate + breakdown).
   - Emergency finder (permission → nearest list + call/directions).
   - Health vault (upload/list/preview/download).
3. UX quality: skeletons, empty states, toasts, inline validation, accessible components.
4. Data layer: React Query with robust loading/error retries.

**Phase 2 User Stories**
1. As a user, I can search hospitals by city/specialty/price and open a detailed profile.
2. As a user, I can compare 2–3 hospitals side-by-side on cost, beds, ratings, and Value Score.
3. As a user, I can upload/paste a bill and get a clean, line-item analysis with flags.
4. As a user, I can estimate treatment cost and see what drives the price (room, surgeon, implants, etc.).
5. As a user in an emergency, I can find the nearest hospital fast with call + directions.
6. As a user, I can upload health documents and manage them in a secure vault.

**Testing**
- Run `testing_agent_v3`: validate all Phase-1 flows unauthenticated, mobile + dark mode smoke.

**Exit Criteria**
- All 5 Phase-1 flows work end-to-end with no console errors and good empty/loading states.

---

### Phase 3 — Auth + Hardening + 2nd E2E test
**Focus:** Production readiness (auth, security, stability) without breaking V1.

**Steps**
1. Add Email/Password + JWT auth (refresh tokens, secure cookies where appropriate).
2. Add Google OAuth (Emergent) with environment-safe redirect config.
3. Add authorization rules:
   - Vault documents are user-scoped.
   - Saved comparisons/estimates optional user-scoped persistence.
4. Security + reliability:
   - Input validation, file-type limits, upload scanning hooks (future).
   - Basic abuse protection for AI endpoints (rate limiting, quotas).
5. Add user settings/profile (theme, city defaults).

**Phase 3 User Stories**
1. As a user, I can sign up/login with email and keep my vault private.
2. As a user, I can log in with Google in one click.
3. As a user, I can revisit my uploaded documents and prior analyses.
4. As a user, I can log out from all devices for safety.
5. As a user, I can manage my profile and default city for faster searches.

**Testing**
- Run `testing_agent_v3`: authenticated flows + access control checks.

**Exit Criteria**
- Auth stable; vault isolation verified; no regressions in Phase-1 flows.

---

### Phase 4 — Phase-2 Features + 3rd E2E test
**Focus:** Extend modularly without refactoring core.

**Steps**
1. Doctor directory + appointment request (MVP: request + confirmation, no payments).
2. Family profiles (MVP: dependents + document tagging).
3. Preventive package comparator (seed data, filters, transparency score).
4. WhatsApp bot integration (MVP: webhook-ready + FAQ/estimate linkouts).
5. Insurance coverage analyzer (MVP: rule-based + AI explanation layer).

**Phase 4 User Stories**
1. As a user, I can find doctors by specialty/city and request an appointment.
2. As a user, I can create family profiles and tag documents to each person.
3. As a user, I can compare preventive packages by inclusions and price.
4. As a user, I can start key flows from WhatsApp and continue on the web.
5. As a user, I can understand what my insurance likely covers with clear caveats.

**Testing**
- Run `testing_agent_v3`: new feature flows + regression.

---

### Phase 5 — Enterprise Documentation Package (in `/app/docs`)
**Outputs**
- PRD, BRD, Architecture, API docs, Compliance (DPDP), Privacy/ToS/Disclaimer, Brand guide.
- Financial model (36 months, 3 scenarios) + GTM playbook + 12-slide investor deck.

---

## 3) Next Actions (Immediate)
1. Implement `AIProvider` + `ClaudeProvider` and create `backend/scripts/test_core.py`.
2. Run POC iterations until schemas are stable.
3. Once POC passes, build V1 backend routes + seed hospitals.
4. Build V1 frontend pages + connect APIs.
5. Run first E2E test, fix, then proceed to auth.

---

## 4) Success Criteria
- POC: schema-valid Claude outputs for bill analysis + cost estimation across multiple inputs.
- V1: all 5 Phase-1 user flows complete end-to-end on mobile and desktop in light/dark modes.
- Reliability: robust loading/empty/error states; no console errors.
- Security: vault user isolation post-auth; basic rate limiting for AI endpoints.
- Documentation: all enterprise docs generated in `/app/docs` and aligned with implemented system.
