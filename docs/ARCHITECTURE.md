# GavixaCare — System Architecture

> **Version:** 1.0 · **Status:** MVP delivered

## 1. High-level Topology

```
┌────────────────────────────────────────────────────┐
│  React 19 SPA  (Tailwind, shadcn/ui, Framer Motion)         │
│  ▪ Public landing + auth                                     │
│  ▪ AppShell (Topbar + BottomNav)                             │
│  ▪ Directory, Detail, Compare, Bill Analyzer, Estimator,     │
│    Emergency, Vault, Settings                                │
│  ▪ Theme (light/dark) + WCAG AA                              │
└──────────────┬─────────────────────────────────────────────┘
               │   REST /api  (JWT Bearer or session_token cookie)
               ▼
┌────────────────────────────────────────────────────┐
│  FastAPI (Python 3.11) ─ supervisord ─ uvicorn (:8001)      │
│                                                             │
│  Routers:  /auth  /hospitals  /ai  /emergency  /vault       │
│  Services: AuthService, HospitalService, VaultService,      │
│            BillAnalysis, CostEstimator                      │
│  Core:     AIProvider (Claude, extensible), Config, DB,     │
│            Security (bcrypt + JWT), Deps                    │
└──────────┬──────────┬─────────────────────────────────┘
           │          │
           ▼          ▼
     MongoDB       Emergent LLM Gateway ──▶ Anthropic Claude Sonnet 4.5
     (Motor)                                (via emergentintegrations)

     users, user_sessions, hospitals, vault_documents,
     bill_analyses (Phase 3), cost_estimates (Phase 3)
```

## 2. Backend Layout

```
backend/
├── server.py                # FastAPI app + lifespan (seeds hospitals & demo user)
├── app/
│   ├── core/
│   │   ├── config.py         # Pydantic settings from .env
│   │   ├── db.py             # Motor client + get_db()
│   │   ├── security.py       # bcrypt + PyJWT helpers
│   │   ├── deps.py           # get_current_user / get_optional_user
│   │   └── ai_provider.py    # AIProvider ABC + ClaudeProvider + JSON extraction
│   ├── schemas/
│   │   ├── ai.py             # BillAnalysisResult, CostEstimateResult, ...
│   │   ├── hospital.py       # Hospital, ValueScore, BedAvailability, PriceItem
│   │   ├── user.py           # UserPublic, LoginResult, ProfileUpdate
│   │   └── vault.py          # VaultDocument, VaultUploadPayload
│   ├── services/
│   │   ├── auth_service.py   # signup, login, Google OAuth exchange, logout, demo seed
│   │   ├── hospital_service.py     # search, detail, compare, nearest (haversine)
│   │   ├── hospital_seed.py  # 32 hospitals across 11 cities (idempotent upserts)
│   │   ├── vault_service.py  # user-scoped CRUD, 8MB limit
│   │   ├── bill_analysis.py  # Prompt + schema for Claude
│   │   └── cost_estimator.py # Prompt + schema for Claude
│   └── routers/
│       ├── auth.py
│       ├── hospitals.py
│       ├── ai.py
│       ├── emergency.py
│       └── vault.py
├── scripts/
│   └── test_core.py         # Phase 1 POC — validated Claude for both AI flows
└── requirements.txt         # motor, fastapi, pydantic, pyjwt, bcrypt,
                              # emergentintegrations, httpx
```

## 3. Frontend Layout

```
frontend/src/
├── App.js                   # Router + AuthProvider + ThemeProvider
├── index.css                # Design tokens (light + dark) as CSS vars
├── lib/
│   ├── api.js               # axios client with JWT + credentials
│   └── format.js            # INR formatters, dates, initials, classNames
├── context/
│   ├── AuthContext.jsx      # user state, login/signup/logout, Google session
│   └── ThemeContext.jsx     # light/dark with localStorage
├── constants/
│   └── testIds/index.js     # Central data-testid registry
├── components/
│   ├── brand/Logo.jsx
│   ├── layout/
│   │   ├── AppShell.jsx     # Topbar + BottomNav + main outlet
│   │   ├── Topbar.jsx
│   │   ├── BottomNav.jsx    # mobile
│   │   ├── ProtectedRoute.jsx
│   │   └── ThemeToggle.jsx
│   ├── common/
│   │   ├── ScoreRing.jsx    # SVG gradient ring for Value Score
│   │   ├── TierBadge.jsx
│   │   └── State.jsx        # EmptyState + InlineAlert
│   └── ui/                  # shadcn primitives
└── pages/
    ├── LandingPage.jsx
    ├── auth/{LoginPage, SignupPage, AuthCallback}
    ├── DashboardPage.jsx
    ├── hospitals/{HospitalsListPage, HospitalDetailPage, HospitalComparePage}
    ├── BillAnalyzerPage.jsx
    ├── CostEstimatorPage.jsx
    ├── EmergencyPage.jsx
    ├── VaultPage.jsx
    ├── SettingsPage.jsx
    └── NotFoundPage.jsx
```

## 4. Data Model (MongoDB Collections)

### `users`
```json
{
  "user_id": "user_9a3f...",
  "email": "demo@gavixacare.in",
  "name": "Demo Patient",
  "picture": null,
  "role": "patient",
  "auth_provider": "email" | "google",
  "password_hash": "$2b$12$...",
  "default_city": "Delhi",
  "language": "en",
  "created_at": "2026-..."
}
```

### `user_sessions` (Google OAuth)
```json
{
  "session_token": "...",
  "user_id": "user_...",
  "expires_at": ISODate,
  "created_at": ISODate,
  "provider": "google"
}
```

### `hospitals`
See `Hospital` schema. Includes nested `value_score`, `beds`, and `pricing[]`.

### `vault_documents`
```json
{
  "doc_id": "doc_...",
  "user_id": "user_...",
  "title": "Lab report Mar 2026",
  "doc_type": "lab_report" | "prescription" | "discharge_summary" | "imaging" | "bill" | "other",
  "file_name": "labs.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 123456,
  "content_base64": "...",
  "for_member": null,
  "tags": [],
  "notes": "",
  "created_at": "..."
}
```

## 5. AI Provider Abstraction

```python
class AIProvider(ABC):
    async def generate_json(*, system_prompt, user_prompt, ...) -> dict

class ClaudeProvider(AIProvider):
    # Uses emergentintegrations.LlmChat with model=claude-sonnet-4-5-20250929
    # Retries transient budget/rate errors up to 3x.
    # Strict JSON extraction from fenced blocks or balanced braces.
```

Swap providers via `DEFAULT_AI_PROVIDER` env var. Future providers plug in without touching services.

## 6. Auth Flow (dual)

### Email/password
1. `POST /api/auth/signup` → hash bcrypt, insert user, sign JWT
2. `POST /api/auth/login` → verify hash, sign JWT
3. Frontend stores JWT in `localStorage` and attaches `Authorization: Bearer` on every request

### Google (Emergent-managed)
1. Frontend redirects to `https://auth.emergentagent.com/?redirect=<origin>/app`
2. Emergent bounces back to `/#session_id=...`
3. `AuthCallback` sends session_id to `POST /api/auth/google/session`
4. Backend exchanges with Emergent, upserts user, sets `session_token` cookie (httpOnly, secure, SameSite=None)

Dependency `get_current_user` accepts BOTH `Bearer JWT` and `session_token` cookie.

## 7. Deployment

- **Backend:** supervisord (`backend:` program) runs uvicorn on `0.0.0.0:8001`
- **Frontend:** supervisord (`frontend:` program) runs CRA on `0.0.0.0:3000`
- **Ingress:** routes `/api/*` → :8001, everything else → :3000
- **Env:** `MONGO_URL`, `DB_NAME`, `EMERGENT_LLM_KEY`, `JWT_SECRET_KEY`, `DEFAULT_AI_MODEL`
- **MongoDB:** provided by platform (local mongod on 27017)

## 8. Scaling Roadmap (Phase 3+)

- Redis for hospital search cache + rate limit
- Typesense / Elasticsearch for typo-tolerant search
- Kafka + Bull for async OCR / bill processing
- Pinecone for RAG over medical procedures and past bills
- CloudFront + S3 for encrypted vault docs (replace base64)
- Multi-AZ EKS in ap-south-1 (Mumbai)
- SOC 2 + VAPT program from Series A onward
