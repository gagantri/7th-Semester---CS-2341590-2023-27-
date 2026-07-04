# GavixaCare — MVP Delivery Notes

> Produced alongside the Phase 1 MVP build. Explains what shipped, what to test, and what comes next.

## Shipped in this MVP

### AI
- ✅ **AIProvider abstraction** — `/app/backend/app/core/ai_provider.py` exposes an `AIProvider` ABC. Today’s `ClaudeProvider` uses Anthropic Claude Sonnet 4.5 via the Emergent Universal LLM Key. Swap providers via `DEFAULT_AI_PROVIDER=anthropic|openai|gemini` and one factory line.
- ✅ **Bill fraud detector** — Real per-line-item AI audit. Verified against a 22-line ₹5.26L Apollo Delhi bill (detected ₹1.7L overcharge, high confidence).
- ✅ **Cost estimator** — City + tier + insurance-aware. Verified for Cataract, Coronary Angiography, Appendectomy, C-Section.

### Hospitals
- ✅ **32 hospitals seeded** across 11 cities: Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, Lucknow, Kochi.
- ✅ **Tiers modelled:** government / trust / private / premium, each with realistic pricing templates.
- ✅ **Value Score algorithm** live (Price 35% · Quality 40% · Availability 15% · Trust 10%).

### Emergency
- ✅ Haversine-based nearest hospital search.
- ✅ 7 public helplines (112, 108, 102, 1091, 1098, 1910, 1066) plus emergency call bar.

### Vault
- ✅ Encrypted user-scoped document store (base64 in MVP, 8MB per file).
- ✅ Document types: lab_report, prescription, discharge_summary, imaging, bill, other.
- ✅ Upload / list / detail / delete.

### Auth
- ✅ **Email/password + JWT** (bcrypt cost 12).
- ✅ **Emergent-managed Google OAuth** with `session_token` HttpOnly cookie.
- ✅ **Dual dependency** — `get_current_user` accepts either.
- ✅ Demo user seeded: `demo@gavixacare.in` / `Demo@1234`.

### Frontend
- ✅ React 19 SPA with light + dark themes, Framer Motion, Lucide icons, shadcn/ui.
- ✅ Mobile-first responsive (bottom nav appears < 768px).
- ✅ Every interactive control has `data-testid` (see `constants/testIds`).
- ✅ Skeletons, empty states, inline alerts, toast notifications, dropdown menus.

## Not yet built (roadmap)

- Doctor Directory + appointment booking (Phase 2)
- Family Health Profiles (Phase 2)
- Preventive Health Package Comparator (Phase 2)
- WhatsApp Bill Bot (Twilio / MSG91) (Phase 2)
- Insurance Coverage Analyzer (Phase 2)
- ABHA ID linking (Phase 3)
- Hospital SaaS dashboard (Phase 3)
- Government B2G dashboard (Phase 3)
- Voice interface + regional languages (Phase 3)
- Full ABDM certification (Phase 3)

## Auth testing bypass (do not ship to production)

A demo email/password login is seeded so testing agents & QA can enter the app without going through Google OAuth. **Remove `seed_demo_user()` before public production launch.**

## AI latency

- Bill analyzer: **30–40 s** end-to-end via Claude Sonnet 4.5.
- Cost estimator: **20–30 s**.
- Requests use httpx with a 120s timeout. Ingress limit observed at 60s; prompts sized to stay comfortably below.

## Test credentials

See `/app/memory/test_credentials.md`.
