# Client auth integration

Brief guide for mobile/web (and AI agents) integrating with the gym Backend API.

**Base URL:** `https://gym-backend-lovat-mu.vercel.app` (prod) or `http://localhost:3000` (local)  
**Postman publish:** [gym-backend-postman](https://github.com/abdulhasibn/gym-backend-postman) @ `7a2d9bf` · **Working copy:** Postman cloud (`docs/postman-sync.md`) — not vendored in this repo.

There is **no separate sign-up**. First successful OTP verify or Google complete **creates** the app user. Later logins return the same user.

---

## Shared conventions

| Item | Rule |
|------|------|
| Content-Type | `application/json` on request/response bodies |
| Auth header | `Authorization: Bearer <accessToken>` |
| Errors | Always `{ "error": { "code": string, "message": string } }` — no field-level details |
| Lane | `CLIENT` or `STAFF` — chosen on **first** provision; cannot change later (`LANE_MISMATCH`) |

Store after login: `accessToken`, `refreshToken` (OTP only), `userId`, `lane`, `roleCode`.

---

## Email OTP (primary)

```
1. Collect email
2. POST /auth/otp/request   { email }  →  { status: "OTP_SENT", isNewUser }
3. If isNewUser: collect lane (CLIENT|STAFF) + optional name
4. User enters code from email
5. POST /auth/otp/verify    { email, token, lane?, name? }
   — include lane only when isNewUser was true
6. Persist session.accessToken (+ refreshToken, expiresIn)
7. Use Bearer token for /auth/me, /gym-orgs, …
```

### Request OTP

`POST /auth/otp/request` — public

```json
{ "email": "member@example.com" }
```

- **202**
  ```json
  { "status": "OTP_SENT", "isNewUser": true }
  ```
  - `isNewUser: true` — no live app account yet; collect `lane` (+ optional `name`) before Verify OTP
  - `isNewUser: false` — returning user; **omit** `lane` on Verify OTP
- **422** `VALIDATION_ERROR` / `EMAIL_ADDRESS_INVALID`
- **429** `AUTH_RATE_LIMITED` · **502** `OTP_DELIVERY_FAILED`

Lane is **not** accepted on request — only on verify when provisioning.

### Verify OTP (sign-in = provision)

`POST /auth/otp/verify` — public

**New user** (`isNewUser: true`):

```json
{
  "email": "member@example.com",
  "token": "123456",
  "lane": "CLIENT",
  "name": "Member"
}
```

**Returning user** (`isNewUser: false`) — omit `lane`:

```json
{
  "email": "member@example.com",
  "token": "123456"
}
```

For **Admin / Staff first provision**, use `"lane": "STAFF"` (→ `STAFF_UNASSIGNED` + `staffCode`).

- `token`: digits only (Postman docs: 6–10; paste the **full** emailed code)
- `lane`: required on **first** provision; omit when Request OTP returned `isNewUser: false`
- `name`: optional (1–120)
- **200**
  ```json
  {
    "session": { "accessToken": "…", "refreshToken": "…", "expiresIn": 3600 },
    "user": {
      "id": "uuid",
      "email": "member@example.com",
      "name": "Member",
      "lane": "CLIENT",
      "roleCode": "CLIENT",
      "staffCode": null,
      "emailVerifiedAt": "2026-08-02T00:00:00.000Z"
    }
  }
  ```
- STAFF first login: `roleCode` = `STAFF_UNASSIGNED`, `staffCode` = non-null string
- **422** `OTP_EXPIRED` (wrong **or** expired) / `VALIDATION_ERROR` / `EMAIL_NOT_VERIFIED` / `LANE_REQUIRED`
- **409** `LANE_MISMATCH` (same email already provisioned on the other lane)
- **429** `AUTH_RATE_LIMITED`

**Postman tip:** set env `email`, run Request OTP, note `isNewUser`, set `lane` only if true, paste code into `otpToken`, then Verify. Re-requesting invalidates the previous code.

---

## Google (optional)

```
1. Collect lane (CLIENT|STAFF) + optional name (API complete body requires lane)
2. Open GET /auth/google/start?redirect_to={webOrigin}/auth/google/callback
   (302 → Supabase Google). `redirect_to` origin must be in API
   `GOOGLE_OAUTH_REDIRECT_ORIGINS` and in Supabase Auth redirect allowlist.
3. After consent, web `/auth/google/callback` reads access_token (+ refresh_token,
   expires_in) from the URL hash
4. POST /auth/google/complete  with Bearer that token
5. Body: { lane, name? }  →  { user }  (tokens are NOT rotated — keep the Google session token)
```

`GET /auth/google/start` — public → redirect; **503** `OAUTH_CONFIGURATION` if Host/callback/`redirect_to` config is missing.

Without `redirect_to`, local/dev may use the API’s Postman helper at `{apiHost}/auth/google/callback`. Production disables that helper — web clients must pass an allowlisted `redirect_to`.

`POST /auth/google/complete` — Bearer (identity)

- **200** `{ "user": { …same shape as OTP user… } }` (no new `session` tokens)
- **401** `AUTHENTICATION_FAILED`
- **422** `GOOGLE_IDENTITY_REQUIRED` / `EMAIL_NOT_VERIFIED` / `VALIDATION_ERROR` / `LANE_REQUIRED`
- **409** `LANE_MISMATCH`

---

## Session

`GET /auth/me` — Bearer (provisioned user)

- **200** `{ "user": { id, email, name, lane, roleCode, staffCode, emailVerifiedAt } }`
- **401** `AUTHENTICATION_FAILED` — missing/invalid token, or identity exists but app user not provisioned yet

Call after cold start to restore UI from a stored token.

---

## Gym orgs (STAFF after login)

Requires Bearer. Create only if `roleCode` is `STAFF_UNASSIGNED` or `ADMIN`.

`POST /gym-orgs`

```json
{
  "name": "North Star Fitness",
  "address": null,
  "contactPhone": null,
  "contactEmail": "hello@example.com",
  "logoUrl": null,
  "timezone": "Asia/Kolkata"
}
```

- **201** `{ "gymOrg": { id, name, address, contactPhone, contactEmail, logoUrl, timezone, ownerUserId, createdAt, updatedAt } }` — create detail has **no** `isOwner` (list items do).
- **401** `AUTHENTICATION_FAILED`
- **403** `GYM_ORG_CREATION_FORBIDDEN` (e.g. CLIENT lane or role not allowed)
- **422** `VALIDATION_ERROR`

`GET /gym-orgs` → **200** `{ "gymOrgs": [{ id, name, timezone, isOwner }] }` (may be `[]`)

---

## Client / Admin UX checklist

1. **No “Sign up” vs “Log in”** — one auth path; first success creates the account.
2. After Request OTP, branch on **`isNewUser`**: show Staff/Client chooser only when `true`; omit `lane` on verify when `false`.
3. On `LANE_REQUIRED`, ask for lane (first provision). On `LANE_MISMATCH`, tell the user this email belongs to the other account type.
4. On `OTP_EXPIRED`, send them back to request a new code (covers wrong **and** expired).
5. Treat any non-2xx as `{ error.code }` — branch UI on `code`, show `message` as fallback.
6. Prefer Postman **Examples** on each request when generating clients (GitHub publish SSOT for Examples).

## Related

- Working collection: Postman cloud — see `docs/postman-sync.md`
- Upstream publish: https://github.com/abdulhasibn/gym-backend-postman
- Agent skills: `sync-postman-collection`, `verify-api-flow`
- Archive research (optional): `docs/archive/research/`
