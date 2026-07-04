# GavixaCare — API Reference

> **Version:** 1.1 · **Base URL:** `${REACT_APP_BACKEND_URL}/api`
> All endpoints are JSON. Auth is **cookie-based by default** (`session_token`
> HttpOnly cookie set by `/auth/signup`, `/auth/login`, `/auth/google/session`).
> Bearer JWT is also accepted for programmatic clients — the same
> `session_token` may be sent as either a cookie **or** a
> `Authorization: Bearer <token>` header.

## Health

### `GET /`
Returns app metadata.

### `GET /health`
Returns `{ status: "ok" }`.

## Auth (`/auth`)

### `POST /auth/signup`
```json
{
  "email": "a@b.com",
  "password": "Testpass123",
  "name": "Anjali Sharma",
  "default_city": "Delhi"
}
```
→ `{ user: UserPublic, access_token: string, token_type: "Bearer" }`

### `POST /auth/login`
```json
{ "email": "a@b.com", "password": "Testpass123" }
```
→ same as signup.

### `POST /auth/google/session`
Body: `{ "session_id": "<from Emergent OAuth redirect>" }` → sets `session_token` HttpOnly cookie.

### `GET /auth/me`
Requires auth. Returns `UserPublic`.

### `PATCH /auth/me`
Body: `{ name?, default_city?, language? }` → updated `UserPublic`.

### `POST /auth/logout`
Clears session cookie. Returns `{ ok: true }`.

## Hospitals (`/hospitals`)

### `GET /hospitals`
Query: `query, city, tier, specialty, min_value_score, max_price_typical, limit`. Returns `Hospital[]`.

### `GET /hospitals/facets`
Returns `{ cities: string[], specialties: string[], tiers: string[] }`.

### `GET /hospitals/compare?ids=a,b,c`
Returns `Hospital[]` in requested order (2–4 ids).

### `GET /hospitals/{hospital_id}`
Returns single `Hospital`.

## AI (`/ai`)

### `POST /ai/bill-analyze`
```json
{
  "bill_text": "APOLLO HOSPITAL DELHI\n...\nTotal 5,26,400",
  "hospital_name": "Apollo Delhi",
  "city": "Delhi",
  "hospital_tier": "private"
}
```
→ `BillAnalysisResult`. **Latency: 30–40 s.**

### `POST /ai/cost-estimate`
```json
{
  "condition": "Coronary Angioplasty",
  "city": "Mumbai",
  "hospital_tier": "premium",
  "insurance": "5L HDFC ERGO policy",
  "notes": "Elective, 58yo male, hypertensive"
}
```
→ `CostEstimateResult`. **Latency: 20–30 s.**

## Emergency (`/emergency`)

### `GET /emergency/nearest?lat=&lng=&specialty=&limit=`
Returns:
```json
{
  "hospitals": [Hospital & { distance_km: number }],
  "helplines": {
    "national_emergency": "112",
    "ambulance_national": "108",
    ...
  }
}
```

## Vault (`/vault`) — requires auth

### `POST /vault/documents`
```json
{
  "title": "Lab report Mar 2026",
  "doc_type": "lab_report",
  "file_name": "labs.pdf",
  "mime_type": "application/pdf",
  "content_base64": "<base64>",
  "for_member": null,
  "tags": [],
  "notes": ""
}
```
→ `VaultDocument` (without content).

### `GET /vault/documents?doc_type=&for_member=`
→ `VaultDocument[]` (content omitted).

### `GET /vault/documents/{doc_id}`
→ Full `VaultDocument` including base64 content.

### `DELETE /vault/documents/{doc_id}`
→ `{ ok: true }`.

## Schemas

### `UserPublic`
`{ user_id, email, name, picture?, role, auth_provider, default_city?, language, created_at? }`

### `Hospital`
`{ id, name, city, address, tier, specialties[], accreditation[], rating, review_count, latitude, longitude, phone, emergency_247, value_score{overall,price,quality,availability,trust}, beds{total_beds,icu_beds,free_general_beds,free_icu_beds,last_updated}, pricing[{procedure, low_inr, typical_inr, high_inr, notes}], description, established_year? }`

### `BillAnalysisResult`
`{ summary{ total_billed_inr, estimated_fair_inr, potential_overcharge_inr, overcharge_percent, hospital_name?, city?, hospital_tier }, line_items[{ description, billed_amount_inr, fair_amount_inr, variance_inr, variance_percent, flag, reason }], flags[{ code, severity, title, explanation, evidence }], questions_to_ask[], next_steps[], confidence, caveats[] }`

### `CostEstimateResult`
`{ condition, city, hospital_tier, insurance_context, estimate_inr{low,typical,high}, out_of_pocket_inr?, breakdown[{ category, low_inr, typical_inr, high_inr, notes }], cost_drivers[], savings_tips[], questions_to_ask[], expected_stay_days, confidence, caveats[] }`

## Errors

- `400` — validation failed (Pydantic details)
- `401` — not authenticated
- `404` — not found
- `409` — duplicate (e.g. signup with existing email)
- `413` — payload too large (vault upload > 8MB)
- `502` — upstream AI provider error (transient, retry)
