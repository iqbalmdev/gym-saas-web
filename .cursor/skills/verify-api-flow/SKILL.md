---
name: verify-api-flow
description: Verify Gym Backend auth and Admin API flows via Postman collection/MCP. Use when testing OTP login, tokens, gym-orgs, or Admin endpoints. Source collection from postman/ and docs/api/client-auth.md.
---

# Verify API flow (Gym Backend + Postman)

## Canonical sources

| Source | Path / URL |
|---|---|
| Auth guide | `docs/api/client-auth.md` |
| Collection (vendored) | `postman/Gym-Backend-API.postman_collection.json` |
| Dev environment | `postman/Gym-Backend-Dev.postman_environment.json` |
| Local environment | `postman/Gym-Backend-Local.postman_environment.json` |
| Upstream | https://github.com/abdulhasibn/gym-backend-postman |
| Prod base URL | `https://gym-backend-lovat-mu.vercel.app` |
| Local base URL | `http://localhost:3000` |

Prefer **Postman MCP** to run/update the workspace collection. If MCP is unavailable, use the vendored JSON + `curl` with the same variables.

## Environment variables

Use collection/environment variables — never commit secrets:

- `baseUrl`
- `email`
- `otpToken` (ephemeral; paste full 6-digit code from email)
- `accessToken`
- `refreshToken`
- `lane` — Admin web: `STAFF`; Client: `CLIENT`
- `gymOrgId` (after create/list gym orgs)

## Canonical auth smoke (Admin / STAFF)

1. Select **Gym Backend — dev** (or Local) environment.
2. Set `email` to an inbox you can read; set `lane` = `STAFF`.
3. **Request OTP** — `POST {{baseUrl}}/auth/otp/request` `{ "email": "{{email}}" }` → expect `202` `OTP_SENT`.
4. Paste full email code into `otpToken` (re-request invalidates previous).
5. **Verify OTP** — `POST {{baseUrl}}/auth/otp/verify`  
   `{ "email", "token": "{{otpToken}}", "lane": "STAFF", "name"? }`  
   → store `accessToken` / `refreshToken` from `session`.
6. **Get current user** — `GET {{baseUrl}}/auth/me` with `Authorization: Bearer {{accessToken}}`.
7. If `roleCode` is `STAFF_UNASSIGNED`, optionally **Create gym org** — `POST {{baseUrl}}/gym-orgs`.
8. Run the Admin endpoint under test with the same Bearer token.

## Error handling (do not invent)

Branch on `error.code` from `{ "error": { "code", "message" } }`:

- `OTP_EXPIRED` → request a new OTP
- `LANE_MISMATCH` → email already on the other lane
- `AUTH_RATE_LIMITED` → wait ~60s
- `AUTHENTICATION_FAILED` → missing/invalid token or user not provisioned

## Notes

- No separate sign-up — first successful verify **provisions** the user.
- Admin web hard-codes **STAFF** lane; never offer Client invite accept on a Staff account.
- Prefer Postman **Examples** on each request when generating typed clients.
- Record real failures in the reply; never invent successful payloads.
- After verifying a new endpoint, note it in `docs/PROGRESS.md` if it unblocks a feature slice.
