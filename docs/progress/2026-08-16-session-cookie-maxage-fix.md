# 2026-08-16 — Fix: session cookie still logged users out after ~1h

Follow-up to [2026-08-15 silent session refresh](2026-08-15-silent-session-refresh-proxy.md)
(`0bfd772`) — the proxy-based refresh landed but users were still bounced to
`/login` after almost exactly one hour.

**Root cause:** `setSession()` (`lib/auth/session.ts`) set the cookie's own
`Max-Age` from `snapshot.expiresAt` — the access token's ~1h TTL. That ties
the browser's cookie lifetime to the access token, not the refresh token.
`proxy.ts` only rotates the cookie when a request lands within the last 60s
before that deadline; any request earlier than that doesn't trigger a
refresh (not near expiry yet), and the *browser itself* deletes the cookie
the instant `Max-Age` elapses — client-side, no server round trip. If the
user's last request before the hour mark happened to fall outside that
60-second window (extremely likely under normal, not-constantly-clicking
use), the cookie was just gone on the next request: indistinguishable from a
fresh logout, and proxy never got a chance to run. `proxy.ts`'s own
`response.cookies.set(...)` had the identical bug on every successful
rotation — it recomputed `maxAge` from the *new* `rotated.expiresAt`, so
even a successful refresh only bought another narrow ~1h window with the
same failure mode.

**Fix:** decoupled the cookie's outer `Max-Age` from the payload's
`expiresAt`. New `SESSION_COOKIE_MAX_AGE_SECONDS` (30 days,
`lib/auth/session-model.ts`) is now what both `setSession()` and `proxy.ts`
pass as `maxAge` — the payload's `expiresAt` still tracks the access token
and still drives `needsRefresh()`/`getSession()`, but the cookie itself now
survives in the browser far longer than the access-token window, so
whenever the user does make a request — however overdue — `proxy.ts` gets a
chance to refresh it instead of the browser having silently discarded it
first. If the refresh token is genuinely dead server-side by then,
`/auth/refresh` 401s and proxy clears the cookie as before — that's the
correct terminal case, not this bug.

Added a regression-guard unit test (`session.test.ts`) asserting the max-age
constant stays an order of magnitude larger than a single access-token TTL,
so this can't quietly regress back to `expiresAt`-derived again.

**Still open** (unchanged from the 08-15 entry): confirm via `verify-api-flow`
whether `POST /auth/refresh` accepts Google-lane refresh tokens too, and
whether the 30-day cookie ceiling should be reconciled with the backend's
actual refresh-token TTL once that's documented — worth a Postman check.
