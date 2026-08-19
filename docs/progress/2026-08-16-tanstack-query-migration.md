# 2026-08-16 — TanStack Query migration (all six Admin modules)

Decision, rejected alternatives, and the three pilot findings in **ADR-0011**.

## Why

ADR-0009 fixed *perceived* navigation latency but couldn't fix time-to-data, because on
serverless there is no durable server-side cache: `unstable_cache` is deprecated,
`use cache` entries "typically don't persist across requests", React `cache()` dedupes
only within one request, and layouts don't re-render on soft navigation. A client cache
is indifferent to all of that — it lives in the browser and survives navigation.

## Shape (per module)

| File | Role |
|---|---|
| `<m>-query-keys.ts` | pure key factory, imported by client *and* server |
| `<m>-queries.ts` | server-only read via ports |
| `app/api/<m>/route.ts` | gate → **same** query fn → JSON |
| `<m>-hooks.ts` | `'use client'` — `useQuery` / `useMutation` |

One shared server function behind both entry points, so the RSC prefetch and the client
refetch can't drift. Pages stay RSC: `prefetchQuery` + `<HydrationBoundary>`, so first
paint still ships with data and ADR-0009's `loading.tsx` work survives intact.

Mutations wrap the **existing** Server Actions — the auth → lane → tenant gate in
`<m>-actions.ts` was not rewritten or relocated, and `revalidatePath` stays.

## Foundation

- `lib/query/query-client.ts` — per-request client on the server (a module singleton
  would leak one user's tenant data into another's render), tab singleton in the browser.
  `staleTime: 30s`, `gcTime: 5min`, retry only on 5xx/network — a 4xx is a considered
  rejection.
- `components/query/query-provider.tsx`, mounted in the root layout.
- `lib/query/api-fetch.ts` — the only sanctioned browser `fetch`, `/api/*` only. Added as
  the single exemption to the `no-restricted-globals` architecture rule, whose message now
  points here.
- `lib/auth/staff-gym-gate.ts` — gate for route handlers. The per-module helpers can't be
  reused: `'use server'` turns every export into a callable action.

## Migrated

plans · leads · membership-invites (+ roster, as **separate** query keys so a check-in
block doesn't refetch the invite list) · attendance · subscriptions · staff-invites.

Retired: all six `*-data.tsx` fetch components, every `useOptimistic` block, and 16 of 22
`router.refresh()` sites.

## Three findings the plan didn't predict

**1. `e2e-fixtures.ts` was instantiated twice per server — the blocker.** The Plans
create/delete spec failed. A probe showed `/api/plans` returning the same seeded plans
before *and* after a create, while the RSC page saw the new one: Next bundles route
handlers separately from page/Server-Action code, so the fixture module had two copies
with independent state. Production is unaffected (`createAppServices()` is stateless), but
it would have broken all six modules. Fixed by backing all ten mutable containers with a
`globalThis` store. First hypothesis — `revalidatePath` racing TanStack — was **tested and
disproved**, so it stays.

**2. Row mutation hooks must live in the parent.** A `useMutation` that optimistically
removes its own row unmounts itself, destroying the hook and its error state — the same
trap `useOptimistic` had. `leads-admin-panel.tsx` owns status-change and delete; the row
keeps only `useUpdateLead`, which never removes it.

**3. Shell-mode mutations keep `router.refresh()`.** Create-gym and accept-staff-invite
change gym affiliation, which decides the Admin shell's mode — cache invalidation cannot
re-render a layout. Those, the auth flows, and the two CLIENT-persona screens are the 6
remaining `router.refresh()` sites.

## Verified

`npm run verify` (format, lint `--max-warnings=0`, typecheck, 64 unit tests), `next build`,
and the full Playwright suite **30/30** — **with no spec edits**, which is the
behaviour-neutrality proof for a single-pass migration of this size.

## Follow-ups

- CLIENT persona (`membership-invite-inbox`, `data-grants-panel`) still uses
  Server Actions + `router.refresh()`; migrate if that surface grows.
- The gym lookup is now cached client-side, so ADR-0009's deferred round trip is closed
  for navigation without needing gym affiliation in the session.
