# Client auth integration

Brief guide for mobile/web (and AI agents) integrating with the gym Backend API.

**Base URL:** `https://gym-backend-lovat-mu.vercel.app` (prod) or `http://localhost:3000` (local)  
**Postman:** [gym-backend-postman](https://github.com/abdulhasibn/gym-backend-postman) — also vendored under `postman/` in this repo.

There is **no separate sign-up**. First successful OTP verify or Google complete **creates** the app user. Later logins return the same user.

---

## Shared conventions

| Item | Rule |
|------|------|
| Content-Type | `application/json` on request/response bodies |
| Auth header | `Authorization: Bearer <accessToken>` |
| Errors | Always `{ "error": { "code": string, "message": string } }` — no field-level details |
| Lane | `CLIENT` or `STAFF` — chosen on first provision; cannot change later (`LANE_MISMATCH`) |

Store after login: `accessToken`, `refreshToken` (OTP only), `userId`, `lane`, `roleCode`.

---

## Email OTP (primary)

```
1. Collect email (+ lane + optional name on the verify screen)
2. POST /auth/otp/request   { email }
3. User enters code from email
4. POST /auth/otp/verify    { email, token, lane, name? }
5. Persist session.accessToken (+ refreshToken, expiresIn)
6. Use Bearer token for /auth/me, /gym-orgs, …
```

### Request OTP

`POST /auth/otp/request` — public

```json
{ "email": "member@example.com" }
```

- **202** `{ "status": "OTP_SENT" }`
- **422** `VALIDATION_ERROR` / `EMAIL_ADDRESS_INVALID`
- **429** `AUTH_RATE_LIMITED` · **502** `OTP_DELIVERY_FAILED`

### Verify OTP (sign-in = provision)

`POST /auth/otp/verify` — public

```json
{
  "email": "member@example.com",
  "token": "123456",
  "lane": "CLIENT",
  "name": "Member"
}
```

For **Admin web**, use `"lane": "STAFF"` (first login → `STAFF_UNASSIGNED` + `staffCode`).

- `token`: digits only, length matches project OTP setting (currently **6**) · `lane`: required · `name`: optional (1–120)
- Paste the **full** code from the email. Partial codes fail as `OTP_EXPIRED`.
- **200** returns `{ session: { accessToken, refreshToken, expiresIn }, user: { id, email, name, lane, roleCode, staffCode, emailVerifiedAt } }`
- STAFF first login: `roleCode` = `STAFF_UNASSIGNED`, `staffCode` = non-null string
- **409** `LANE_MISMATCH` (same email already provisioned on the other lane)

**Postman tip:** set env `email`, run Request OTP once, paste full code into `otpToken`, then Verify. Re-requesting invalidates the previous code.

---

## Google (optional)

```
1. Open GET /auth/google/start in a browser
2. After consent, capture access_token from the callback URL hash
3. POST /auth/google/complete with Bearer that token
4. Body: { lane, name? } → { user } (tokens are NOT rotated — keep the Google session token)
```

---

## Session

`GET /auth/me` — Bearer (provisioned user)

- **200** `{ "user": { id, email, name, lane, roleCode, staffCode, emailVerifiedAt } }`
- **401** `AUTHENTICATION_FAILED`

---

## Gym orgs (STAFF after login)

Requires Bearer. Create only if `roleCode` is `STAFF_UNASSIGNED` or `ADMIN`.

`POST /gym-orgs` — body includes `name`, optional address/contact/logo, `timezone` (default `Asia/Kolkata`).

`GET /gym-orgs` → `{ "gymOrgs": [{ id, name, timezone, isOwner }] }`

---

## Client / Admin UX checklist

1. **No “Sign up” vs “Log in”** — one auth path; first success creates the account.
2. Ask for **lane** before verify (Admin web hard-codes `STAFF`).
3. On `LANE_MISMATCH`, tell the user this email belongs to the other account type.
4. On `OTP_EXPIRED`, request a new code.
5. Branch UI on `error.code`; show `message` as fallback.
6. Prefer Postman **Examples** on each request when generating clients.

## Related

- Vendored collection: `postman/Gym-Backend-API.postman_collection.json`
- Environments: `postman/Gym-Backend-Dev.postman_environment.json`, `Gym-Backend-Local.postman_environment.json`
- Upstream: https://github.com/abdulhasibn/gym-backend-postman
- Agent skill: `verify-api-flow`
