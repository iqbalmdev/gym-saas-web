# 2026-08-15 — Silent session refresh via `proxy.ts`

Users were bounced back to `/login` about once an hour: `getSession()`
(`lib/auth/session.ts`) treated an access token past `expiresAt` identically
to no session at all and never touched the `refreshToken` already sitting in
the cookie. The architecture doc's `client.ts` comment (`# ... refresh retry
once`) predated any refresh endpoint and was never implemented.

Upstream `gym-backend-postman` has since gained `POST /auth/refresh` (rotates
the pair; old refresh token invalidated on use) — not yet reflected in
`docs/api/client-auth.md`, now fixed alongside this change.

**Why not a `client.ts` retry-on-401:** the refresh token rotates on every
use, and most Admin data loads through Server Components, which cannot write
cookies (only Server Actions/Route Handlers/Proxy can). A reactive retry
inside the HTTP client could recover one render in memory but has nowhere to
persist the new rotated refresh token — the next request would retry with the
now-burned old one and hard-fail. That would turn "expires hourly" into
"permanently logged out after the first silent recovery."

**What shipped instead:** `proxy.ts` at the repo root (Next 16 renamed
`middleware.ts` → `proxy.ts`; confirmed against the vendored
`node_modules/next/dist/docs`, this repo is on Next 16.3.0). It decodes the
session cookie on every request (cheap, no I/O) and only calls
`POST /auth/refresh` when `needsRefresh()` says the access token is within 60s
of `expiresAt`. On success it rotates the cookie via
`rotateSessionSnapshot()` and writes it to both the incoming request (so the
current render sees it) and the outgoing response (so the browser does). A
definitive `401` from the refresh call clears the cookie, which the existing
per-page `getSession()` → `redirect('/login')` gates already handle
identically to "no session" — proxy makes no allow/deny decision itself
(`security-data-access.mdc` stays the sole authority). Transient failures
(network/5xx) leave the cookie untouched rather than forcing a logout.

**New:** `proxy.ts`; `AuthGateway.refreshSession` port method +
`auth-adapter.ts`/`auth-fake.ts`/`e2e-fixtures.ts` implementations;
`rotateSessionSnapshot`/`needsRefresh` in `lib/auth/session-model.ts` (unit
tested in `session.test.ts` alongside the existing `buildSessionSnapshot`
cases).

**Unchanged, deliberately:** `getSession()`/`setSession()`/`clearSession()`,
every page/action auth gate, and `lib/api/client.ts` — the fix lives entirely
underneath them.

**Open follow-up:** whether `/auth/refresh` accepts a refresh token minted by
the Google OAuth lane (`/auth/google/complete` documents its tokens as "not
rotated," but they may still be ordinary Supabase session tokens the refresh
endpoint can rotate) is unconfirmed — verify via the `verify-api-flow` skill.
If it doesn't, Google-lane sessions still expire on the old cadence; that's a
smaller, separate follow-up, not a blocker for the common OTP-lane path.
