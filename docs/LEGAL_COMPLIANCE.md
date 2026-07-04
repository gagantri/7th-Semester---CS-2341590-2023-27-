# GavixaCare — Legal & Compliance

## 1. Applicable Frameworks

1. **Digital Personal Data Protection Act, 2023 (DPDP)** — India’s consumer data protection law. GavixaCare is a **Data Fiduciary**.
2. **Ayushman Bharat Digital Mission (ABDM)** — Phase 2 will link ABHA IDs and integrate with the Health Facility Registry (HFR) + Healthcare Professionals Registry (HPR).
3. **National Medical Commission Act, 2020** — Doctor verification will reference the NMC registry.
4. **IRDAI regulations** — Any insurance comparison or lead generation must be IRDAI-compliant.
5. **Consumer Protection Act, 2019** — Platform liability for demonstrably incorrect information.
6. **IT Act 2000 + IT Rules 2021** — Intermediary liability, content takedown, grievance officer.
7. **Medical Council (Professional Conduct) Regulations 2002** — No advertising of specific doctors; comparisons must remain neutral.

## 2. Data Fiduciary Obligations (DPDP)

### Data Protection Officer (DPO)
Must be appointed. Contact must be surfaced in-app and on the website.

### Consent Management Framework (MVP + Phase 2)
- Granular consent per data category: profile, health documents, location, AI processing, marketing.
- Every consent event logged with `who / what / when / mechanism`.
- Explicit consent required before storing health records or invoking AI on user data.

### Data Principal Rights (must be honoured within 30 days)
- **Right to access:** `GET /api/auth/me` → to be expanded to `/api/privacy/export` (Phase 2).
- **Right to erasure:** account deletion pipeline that removes users, sessions, vault docs, saved analyses.
- **Right to correction:** `PATCH /api/auth/me`.
- **Right to grievance:** grievance officer email + response SLA.

### Cross-border transfer
- All health data hosted in **India (ap-south-1 Mumbai)** at scale.
- LLM calls to Anthropic (via Emergent Universal LLM Key) are processed in USA — users are notified of this in the AI feature disclaimers.
- No third-country transfer of health documents (Phase 2 will store vault docs in India-only S3).

## 3. Consent Flow (Phase 2 spec)

1. Signup → mandatory acceptance of Privacy Policy + Terms + Medical Disclaimer.
2. Optional: marketing communications, anonymised research, AI feature-improvement.
3. Each AI feature (Bill Analyzer, Cost Estimator) shows a one-line disclaimer with a link to detailed AI Data Handling.

## 4. AI-specific guardrails

- All AI-generated outputs surface `confidence` (low/medium/high) and `caveats`.
- Bill analyzer explicitly states: *"AI is a decision-support tool. Always confirm with your hospital and doctor."*
- Cost estimator explicitly states: *"Estimates are indicative, not a quote."*
- No AI-based diagnosis. No dosage advice.
- Retention of AI request/response only if user opts in.

## 5. Medical Disclaimer (short form embedded in relevant pages)

> GavixaCare is an informational and decision-support platform, not a medical practitioner. Content provided does not constitute medical advice, diagnosis, or treatment. In an emergency, call 112 or 108 immediately.

## 6. Hospital Data Dispute Protocol

- Any hospital listed can request corrections via a dedicated `data-disputes@gavixacare.in` mailbox.
- Data ops must respond within 48 hours; corrections applied within 7 days if valid.
- Every listing shows `last_updated`.
- Aggregated “price gouging” reporting is done at city / tier level, not by naming individual hospitals in public.

## 7. Documents to publish before public launch

- Privacy Policy (DPDP-compliant) — draft in `/docs/legal/PrivacyPolicy.md` (Phase 2).
- Terms of Service.
- Medical Disclaimer & Limitation of Liability.
- Cookie Policy.
- Data Processing Agreement template (for hospital & insurance partners).
- Grievance Redressal Policy.
- Data Breach Response Protocol (target: 72h regulator notification).

## 8. Vendors / Sub-processors

| Vendor | Data | Purpose | Region |
|---|---|---|---|
| Anthropic (via Emergent) | Bill text, condition text | AI analysis | USA |
| AWS Mumbai (Phase 2) | Vault documents | Storage | India |
| Google Cloud (via Emergent OAuth) | Auth email/name | Sign-in | USA |
| MongoDB Atlas (Phase 2) | User + hospital data | Persistence | India (Mumbai region) |

All vendors will have DPAs on file before launch.

## 9. Security posture

- All health documents encrypted at rest (AES-256) and in transit (TLS 1.3).
- Signed short-lived URLs for document access (Phase 2 with S3).
- Passwords hashed with bcrypt (cost 12).
- JWT access tokens: 60 min. Refresh tokens: 7 days.
- Session cookies: httpOnly, secure, SameSite=None.
- Rate limiting on auth endpoints (Phase 2).
- SOC 2 Type II roadmap starts at Series A.
- Bug bounty from launch (small budget via HackenProof or similar).
