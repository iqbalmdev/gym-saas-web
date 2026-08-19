# ADR-0009: Admin navigation latency — stream the shell, never block on the gym lookup

**Status:** Accepted — **implemented** 2026-08-16
**Date:** 2026-08-16
**Relates to:** ADR-0003 (§ data flow), ADR-0005 (web session), ADR-0008 (module folders)

## Context

Admin navigation felt slow in two distinct ways, reported as: *"click Plans in the
sidebar, it takes some time, then the skeleton shows up, then the data; then click a
filter and the whole page loads again."* Those are two different bugs plus one
irreducible cost.

### The floor: every API call is a remote round trip

`getApiBaseUrl()` defaults to the deployed backend (`gym-backend-lovat-mu.vercel.app`)
and there is no `.env.local` in this repo, so **local dev talks to the remote Vercel
backend**, not a localhost API. Measured from a dev machine against `/health` — an
endpoint that touches no database:

```
ttfb 0.454s · 0.390s · 0.437s   (3 samples, 200 OK)
```

~400ms before any Supabase work. Real endpoints are necessarily slower, and serverless
cold starts add more. Every request also sets `cache: 'no-store'` (`lib/api/client.ts`),
so nothing is reused. This is the backdrop against which both bugs were amplified.

We deliberately keep pointing dev at the deployed backend so real endpoint latency and
errors stay visible during development.

### Bug 1 — the page shell blocked on a network call

`listStaffGymOrgs()` sat **above** the `<Suspense>` boundary in every ops page, because
the page header rendered `{gym.name}`. Nothing — not even the skeleton — could paint
until that round trip resolved:

```
click → getSession() (cookie, ~0ms)
      → listStaffGymOrgs()  ~400ms   ← blank screen
      → shell renders                 ← skeleton finally appears
      → listPlans()         ~400ms
      → data
```

Layouts are not re-rendered on soft navigation, so the page's own call ran on **every**
navigation. React's `cache()` in `list-staff-gym-orgs.ts` dedupes only *within* one
request, not across them.

There was also no `loading.tsx` anywhere in `app/`, so Next had no instant fallback to
show while the RSC response was in flight.

### Bug 2 — filter tabs were raw anchors

The plan-kind and lead-status filters rendered `<a href>`, not `<Link>`. Every filter
click was a **full document navigation**: tear down the SPA, re-request the HTML,
re-download and re-parse the JS bundle, re-hydrate, then redo both API calls. This is
why the filters felt dramatically worse than sidebar navigation, which already used
`next/link` correctly.

The tabs also lived *inside* the data `<Suspense>` boundary, so they vanished into the
skeleton on every filter change — the user lost their place while waiting.

## Decision

1. **Page shells do no network work.** Ops pages await only `getSession()` (a cookie
   read) and `searchParams`. The gym lookup moved into each module's
   `<Module>Data` component, inside the `<Suspense>` boundary. The RSC shell response
   is therefore backend-independent and streams immediately.

2. **`loading.tsx` per route segment** (5 ops routes + settings), reusing the existing
   panel skeletons plus a shared `components/admin/page-header-skeleton.tsx`. Next
   prefetches these fallbacks, so a sidebar click paints instantly rather than after a
   server round trip. The ops dashboard is fully static and needs none.

3. **Filter tabs are `<Link>`, and live in the page shell.** Extracted to
   `components/admin/filter-tabs.tsx` and rendered *above* the data boundary, so
   switching filters is a soft navigation and the tabs stay on screen and clickable
   while the new list streams.

4. **Optimistic list mutations.** Row-level actions (attendance desk-mark, plan
   activate/delete, lead status/delete) use React 19 `useOptimistic` so the UI updates
   before the Server Action resolves, instead of waiting on `router.refresh()`.

### Consequence for the page header

The gym-name eyebrow (small-caps gym name above each ops `<h1>`) was **removed**. It
was the only reason the shell needed the gym lookup, and `AdminShell` already shows the
gym prominently in the sidebar. Restoring it would mean moving it inside the streamed
region, reintroducing a header layout shift.

## Consequences

- Time-to-**first paint** on navigation is now independent of backend latency.
  Time-to-**data** is unchanged: `listStaffGymOrgs` → `listPlans` remains two
  sequential round trips (~800ms), now fully masked behind an instant skeleton. See
  "Deferred" below.
- Two skeleton states can appear in sequence (`loading.tsx`, then the in-page Suspense
  fallback). They are visually near-identical by construction, so the transition reads
  as one continuous load.
- `PageHeaderSkeleton` renders grey bars rather than real copy on purpose: having
  `loading.tsx` duplicate each page's title and description would drift the moment one
  side is edited.
- The plans `<Suspense>` is keyed on the active filter so switching filters shows the
  skeleton rather than silently holding the previous filter's rows.
- `e2e/plans.spec.ts` guards Bug 2 with a `window` probe that survives a soft
  navigation and is wiped by a document reload. It was verified to **fail** against a
  reverted raw-`<a>` implementation before being kept.

## Alternatives considered

| Option | Why not (now) |
|---|---|
| `unstable_cache` around the gym lookup | Explicitly deprecated in Next 16 — the bundled docs say it "has been replaced by `use cache`". AGENTS.md says to heed deprecation notices. |
| `use cache` + `cacheComponents: true` | **Rejected on evidence.** The bundled `use cache` docs state that on **serverless**, "cache entries typically don't persist across requests (each request can be a different instance)". `architecture-plan.md` §3 locks the deploy target to Vercel, so the default in-memory handler would buy ~nothing in production; making it real needs `use cache: remote` with a Redis/KV handler (storage, latency, platform cost). The cache key also includes captured arguments — here the access token, which `proxy.ts` rotates roughly hourly, so entries churn regardless. Enabling the flag is additionally a large migration for this codebase: it makes PPR the default, switches navigation to React `<Activity>`, and requires every `cookies()` read to sit inside a `<Suspense>` — `getSession()` is at the top of both admin layouts and every page. |
| Put `gymOrgId` / `gymName` in the session cookie | **Blocked on a prerequisite.** `encodeSession()` is plain `base64url(JSON)` with no signature or encryption, and `decodeSession()` validates shape only. `httpOnly` stops page JS from reading the cookie but not a user from crafting it by hand. Trusting `gymOrgId` from an unsigned cookie would make it "a value sent from the client", which `000-project-context.mdc` forbids for tenancy. Viable only after the cookie is HMAC-signed (feasible with Node's built-in `crypto`, no new dependency), which needs a server secret and is its own decision. |
| Run the backend locally in dev | Would cut ~400ms to ~15ms locally, but hides real endpoint latency and errors — which we want visible. Orthogonal to the shipped fix. |

## Deferred

Removing the remaining sequential `listStaffGymOrgs` → list round trip needs one of:

- **HMAC-sign the session cookie**, then embed gym affiliation in it (also closes the
  forgeability gap that currently lets `lane` / `roleCode` be hand-crafted — UI-level
  spoofing only today, since the backend validates the access token on every call); or
- **`use cache: remote`** with a real cache handler, if the deployment gains one; or
- a **backend change** so gym-scoped list endpoints derive the tenant from the token,
  removing the dependency entirely.

None is required for the perceived-latency fix; all three are real options once the
deployment story is settled.
