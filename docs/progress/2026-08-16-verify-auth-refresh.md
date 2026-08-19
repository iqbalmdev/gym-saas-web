# 2026-08-16 — Verified `POST /auth/refresh` against prod

Manual `curl` verification against `https://gym-backend-lovat-mu.vercel.app`
(Postman MCP not connected in this environment — same endpoints, no
collection layer). OTP login as `arzzam19@gmail.com` (STAFF/ADMIN,
pre-provisioned).

**Rotation, confirmed as documented:**

```
verify   → refreshToken A
refresh(A) → 200, refreshToken B (≠ A)
refresh(B) → 200, refreshToken C (≠ B)
refresh(A) → 401 AUTHENTICATION_FAILED   (now genuinely stale)
refresh(B) → 401 AUTHENTICATION_FAILED   (now genuinely stale)
```

**Unexpected but favorable nuance:** immediately re-using the *just-superseded*
token (`refresh(A)` called again right after `refresh(A)→B`, before `B` was
itself rotated) returned `200` with the **same** session (`B`) again,
repeatedly, for at least ~15s — not an immediate `401`. This is Supabase
GoTrue's refresh-token **reuse-interval grace window**, not a bug: it exists
so two near-simultaneous refresh attempts (two tabs, a prefetch racing a real
navigation) don't invalidate each other. Relevant to `proxy.ts`: concurrent
requests landing in the same near-expiry window are safe, not a source of
spurious logouts. A token is only rejected once the chain has genuinely moved
past it.

**Google-lane compatibility (`docs/PROGRESS.md` open item) — resolved by
inference, not a direct test:** decoded the returned access token; `iss` is
`https://igcmptpjmagzwoccxcnw.supabase.co/auth/v1` — a raw Supabase Auth
issuer, not a backend-wrapped token. The backend passes through real Supabase
sessions rather than minting its own, so `/auth/refresh` is almost certainly a
thin proxy to Supabase's own `grant_type=refresh_token`, keyed only on the
refresh token string — independent of whether the original session came from
email OTP or Google OAuth (`/auth/google/complete` produces an ordinary
Supabase session in the same project). Running the actual Google OAuth
browser consent flow to prove this directly was out of scope for a curl-based
check; treat this as high-confidence, not certain, until someone hits it
live.

No code changes from this entry — verification only.
