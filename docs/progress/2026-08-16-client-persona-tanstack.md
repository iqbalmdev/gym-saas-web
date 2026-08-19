# 2026-08-16 — CLIENT persona on TanStack Query

Closes the ADR-0011 follow-up: `membership-invite-inbox` and `data-grants-panel` were the
last domain screens still on Server Actions + `router.refresh()`.

## No shell carve-out needed here

Unlike Settings, `app/(client)/client/layout.tsx` depends only on the session **lane**,
not on membership state — so accepting an invite changes nothing the layout renders, and
the whole surface could migrate. (The Staff equivalents keep `router.refresh()` because
the Admin shell's mode is derived from gym affiliation.)

## What changed

- `lib/auth/client-gate.ts` — `requireClientSession()`, the CLIENT-lane mirror of
  `requireStaffGym`. Deliberately **no tenant step**: CLIENT-owned data is scoped by the
  token, and a client may hold memberships at several gyms, so the API — not this gate —
  decides whether a given `gymOrgId` is theirs.
- `getClientHomeForSession()` in `membership-invites-queries.ts` — invite inbox plus one
  grants panel per gym. Also **parallelised** the per-gym grant reads, which the previous
  server component did in a sequential `for` loop.
- `app/api/client/home/route.ts` — gate → shared query → JSON.
- `clientHomeKeys` + `useClientHome` / `useAcceptMembershipInvite` /
  `useUpdateMyDataGrants`.
- `data-grants-panels.tsx` — renders one panel per gym from the same query. Both child
  panels read `clientHome`, so TanStack dedupes it to a single round trip.

Neither mutation is optimistic: the server decides membership status and therefore which
panels exist. Accepting invalidates the whole payload, which is what makes the new gym's
sharing panel appear — the behaviour `client-home.spec.ts` asserts.

## A 404 that isn't an error

`getMyDataGrants` returns 404 when the client has no ACTIVE membership at that gym — the
normal state while an invite is still pending. That stays a *skip*, not an error, so a
pending invite never breaks the inbox. Comment added at the call site since the old code
carried this rule implicitly.

## Verified

`npm run verify` (64 unit tests), `next build`, full Playwright **30/30 with no spec
edits**. `router.refresh()` is now down to **4** call sites, all principled: session
creation (`login-form`, `google-oauth-callback-client`) and shell-mode changes
(`create-gym-form`, `staff-invite-inbox`).
