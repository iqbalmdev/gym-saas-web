---
name: verify-api-flow
description: Verify Gym Backend auth and Admin API flows via Postman MCP cloud collection. Use when testing OTP login, tokens, gym-orgs, or Admin endpoints. Contract: docs/api/client-auth.md; collection lives in Postman cloud (see docs/postman-sync.md).
---

# Verify API flow (Gym Backend + Postman cloud)

## Canonical sources

| Source | Path / URL |
|---|---|
| Auth guide | `docs/api/client-auth.md` |
| Working collection | Postman cloud — **Gym Backend API** (workspace IDs in `docs/postman-sync.md`) |
| Sync skill | `sync-postman-collection` (GitHub → Postman; no local JSON) |
| Upstream publish | https://github.com/abdulhasibn/gym-backend-postman |
| Prod base URL | `https://gym-backend-lovat-mu.vercel.app` |
| Local base URL | `http://localhost:3000` |

Prefer **Postman MCP** against the cloud collection/env. Do **not** expect `postman/*.json` in this repo.

## Environment variables

Use Postman environment variables — never commit secrets:

- `baseUrl` — Dev env: prod Vercel URL; Local env: `http://localhost:3000`
- `email`
- `otpToken` (ephemeral; paste full 6-digit code from email)
- `accessToken`
- `refreshToken`
- `lane` — Admin web: `STAFF`; Client: `CLIENT`
- `gymOrgId` (after create/list gym orgs)

## Canonical auth smoke (Admin / STAFF)

1. Select **Gym Backend — dev** (or Local) in Postman.
2. Confirm `baseUrl` (prod or local) and `lane` = `STAFF`.
3. Optional: `GET {{baseUrl}}/health` → `200` `{"status":"ok"}`.
4. **Request OTP** — `POST {{baseUrl}}/auth/otp/request` `{ "email": "{{email}}" }` → expect `202` `OTP_SENT`.
5. Paste full email code into `otpToken` (re-request invalidates previous).
6. **Verify OTP** — `POST {{baseUrl}}/auth/otp/verify`  
   `{ "email", "token": "{{otpToken}}", "lane": "STAFF", "name"? }`  
   → store `accessToken` / `refreshToken` from `session`.
7. **Get current user** — `GET {{baseUrl}}/auth/me` with `Authorization: Bearer {{accessToken}}`.
8. If `roleCode` is `STAFF_UNASSIGNED`, optionally **Create gym org** — `POST {{baseUrl}}/gym-orgs`.
9. Run the Admin endpoint under test with the same Bearer token.

## Error handling (do not invent)

Branch on `error.code` from `{ "error": { "code", "message" } }`:

- `OTP_EXPIRED` → request a new OTP
- `LANE_MISMATCH` → email already on the other lane
- `AUTH_RATE_LIMITED` → wait ~60s
- `AUTHENTICATION_FAILED` → missing/invalid token or user not provisioned

## Notes

- No separate sign-up — first successful verify **provisions** the user.
- Admin web hard-codes **STAFF** lane; never offer Client invite accept on a Staff account.
- Prefer Postman **Examples** on each request when generating typed clients (may live on GitHub publish if MCP dropped them).
- Record real failures in the reply; never invent successful payloads.
- After verifying a new endpoint, note it in `docs/PROGRESS.md` if it unblocks a feature slice.
- If Postman MCP returns **401 Invalid API Key**, re-login Postman in Cursor Settings → Tools & MCP, then retry.
