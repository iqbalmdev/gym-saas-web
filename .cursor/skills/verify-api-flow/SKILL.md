---
name: verify-api-flow
description: Verify Gym Backend OTP → Bearer → endpoint via Postman MCP cloud collection.
---

# Verify API flow

## Sources

- Auth: `docs/api/client-auth.md` · Invites: `docs/api/staff-invites.md`
- Collection: Postman cloud (**Gym Backend API**) — IDs in `docs/postman-sync.md`
- Publish clone: sibling `../gym-backend-postman`
- Prod: `https://gym-backend-lovat-mu.vercel.app` · Local: `http://localhost:3000`

## STAFF smoke

1. Env: Dev or Local; `lane=STAFF`.
2. Optional `GET /health` → ok.
3. `POST /auth/otp/request` `{ email }` → note `isNewUser`.
4. Paste email code into `otpToken`.
5. `POST /auth/otp/verify` — include `lane` **only** when `isNewUser` was true → store tokens.
6. `GET /auth/me` with Bearer.
7. Optional: `POST /gym-orgs` if unassigned; or staff-invite endpoints under test.

## Errors (do not invent)

`OTP_EXPIRED` · `LANE_MISMATCH` · `AUTH_RATE_LIMITED` · `AUTHENTICATION_FAILED` — branch on `error.code`.

## Notes

- First verify provisions the user (no separate sign-up).
- Prefer Postman Examples; record real failures.
- Postman MCP 401 → re-login Postman in Cursor MCP settings.
