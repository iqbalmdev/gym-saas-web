# ADR-0005: Web session storage (httpOnly cookie)

**Status:** Accepted  
**Date:** 2026-08-04  
**Context:** Architecture-plan open decision A2.

## Decision

Persist Gym Backend OTP session on the Admin web app in an **httpOnly** cookie (`gym_saas_session`), set only from Server Actions / Route Handlers after successful `POST /auth/otp/verify`.

Cookie payload (JSON): `accessToken`, `refreshToken`, `expiresAt`, `userId`, `email`, `name`, `lane`, `roleCode`, `staffCode`.

Flags: `httpOnly`, `sameSite=lax`, `secure` in production, `path=/`, `maxAge` derived from `expiresIn`.

## Consequences

- Browser JS cannot read tokens (XSS cannot steal via `document.cookie`).
- Server Components / Actions read the cookie and pass Bearer to `createAppServices()` adapters.
- Cookie size must stay under ~4KB; current Gym Backend JWTs fit.
- Refresh rotation endpoint is still undocumented — do not invent silent refresh until API documents it (see auth research note).
- Future hardening (encrypt cookie value, BFF-only tokens) can replace encoding without changing ports.

## Alternatives considered

| Option | Why not now |
|---|---|
| Memory-only / localStorage | Lost on refresh; XSS-exposed if localStorage |
| Full BFF that never sends access token to browser | Heavier; defer until refresh story is clear |
