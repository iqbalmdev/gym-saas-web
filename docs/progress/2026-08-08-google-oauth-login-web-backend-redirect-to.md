# 2026-08-08 — Google OAuth login (web + backend redirect_to)

- Web: `completeGoogle` port/adapter/action; login **Continue with Google** → lane → API start with `redirect_to`; `/auth/google/callback` reads hash, keeps Google tokens, session cookie, post-auth redirect.
- Backend (`gym-backend`): allowlisted `?redirect_to=` via `GOOGLE_OAUTH_REDIRECT_ORIGINS`; start works in production without Postman helper.
- Docs: `docs/api/client-auth.md` Google section. Unit + Playwright coverage (fixtures).
- Live Google needs backend deploy + Supabase redirect allowlist for `{web}/auth/google/callback`.
