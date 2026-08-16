# ADR-0011: Adopt TanStack Query as the client data layer

**Status:** Accepted — **implemented** 2026-08-16
**Date:** 2026-08-16
**Amends:** `001-tech-stack.mdc` (moves `@tanstack/react-query` out of "not installed"),
`state-management.mdc` (tier 1), `nextjs-app-router.mdc` (data & mutations)
**Relates to:** ADR-0009 (navigation latency — this supersedes its "Deferred" section)

## Context

ADR-0009 fixed *perceived* navigation latency (stream the shell, `loading.tsx`,
`<Link>`) but could not fix actual time-to-data, and recorded why every option was
blocked:

- `unstable_cache` — deprecated in Next 16.
- `use cache` + `cacheComponents` — the bundled docs state serverless cache entries
  "typically don't persist across requests". `architecture-plan.md` §3 pins the deploy
  target to Vercel, so it buys ~nothing in production without a Redis/KV handler.
- Gym affiliation in the session — needed ADR-0010's signing first, and still needs a
  re-issue path for mid-session affiliation changes.

The pattern underneath all three: **on serverless there is no durable server-side
cache.** React's `cache()` dedupes within one request; layouts are not re-rendered on
soft navigation; so every navigation re-pays every round trip against a backend
measured at ~400ms for a no-op endpoint.

A client-side cache is indifferent to all of that. It lives in the browser, so it
survives navigation regardless of how ephemeral server instances are. The gap that
boxed in ADR-0009 is precisely the gap TanStack Query fills.

Two secondary forces:

- **Optimistic updates are hand-rolled and subtly wrong.** In `leads-admin-panel.tsx` a
  failed delete reverts the optimistic removal, which *remounts the row* and destroys
  its local error state — we had to hoist row errors to the parent to work around it.
  TanStack's `onMutate`/`onError` rollback keeps mutation state outside the tree and
  does not have this failure mode.
- **Upcoming modules** will repeat the same list + filter + mutate shape. Settling the
  pattern now avoids migrating them twice.

## Decision

Adopt `@tanstack/react-query` (v5, peers `react: ^18 || ^19`) as the client data layer
across all six existing modules in **one pass**, and as the default for new modules.

### 1. Mutations wrap the existing Server Actions

`mutationFn` calls the current `'use server'` action directly. The auth → lane → tenant
→ grant gate in `modules/*/*-actions.ts` is **not** rewritten or relocated, so
`security-data-access.mdc` continues to hold unchanged.

```ts
mutationFn: setPlanActiveAction,           // existing action, untouched
onMutate:   snapshot + optimistic write,
onError:    restore snapshot,
onSettled:  invalidateQueries,
```

### 2. Reads: one server function, two entry points

To avoid the classic divergence between "what the server prefetches" and "what the
client refetches", each read is a single server-only function consumed twice:

```
modules/<m>/<m>-queries.ts     getPlansForSession(session, filter)   ← ports, server-only
app/api/<m>/route.ts           gate → same function → JSON           ← client refetch
app/.../page.tsx (RSC)         prefetchQuery({ queryFn: same fn })   ← first paint
modules/<m>/hooks/use-*.ts     useQuery({ queryFn: fetch('/api/…') })
```

Same `queryKey` on both sides. The client `queryFn` only runs on refetch/invalidate;
first paint is served from the dehydrated cache.

### 3. First paint stays server-rendered

Pages remain RSC. They `prefetchQuery` into a per-request `QueryClient` and pass
`dehydrate(qc)` through `<HydrationBoundary>`. No load-time spinner, no tokens in the
browser, and ADR-0009's `loading.tsx` + skeleton work is **retained** — it still covers
the RSC shell on hard navigation.

### 4. Tenancy is unchanged

Route handlers resolve `gym_org_id` from the session server-side, exactly as Server
Actions do today. The client never sends a tenant id. `000-project-context.mdc` holds.

**This also closes ADR-0009's deferred item without needing gym affiliation in the
cookie:** once the gym query is cached client-side, subsequent navigations skip that
round trip entirely. Embedding it in the signed session becomes optional rather than
required.

## Migration sequencing (single pass)

Ordered so a validated pattern exists before it is replicated, even though it lands as
one migration:

1. **Foundation** — install `@tanstack/react-query` + devtools; `QueryClientProvider`
   (per-request client on server, singleton in browser); shared `staleTime` defaults;
   query-key factory convention.
2. **Plans first** — the reference implementation. It is a complete slice (filter +
   create + toggle + delete) and carries the most e2e coverage (3 specs, including the
   soft-nav guard). Its suite must stay green **without spec edits** — that is the
   behaviour-neutrality proof.
3. **Remaining five** — leads, membership-invites (+ roster), attendance, subscriptions,
   staff-invites — each following the Plans shape.
4. **Retire the replaced machinery** — `*-data.tsx` components, `useOptimistic` blocks,
   and the 22 `router.refresh()` call sites.
5. **Amend the rules** (see Consequences) and add a progress entry.

**Gate after every module:** `npm run verify` + `next build` + the full Playwright
suite. All six modules already have e2e coverage, which is the safety net that makes a
single-pass migration defensible.

## What the pilot changed (findings, not predictions)

Three things the plan above did not anticipate. All were caught by the Plans gate
before the pattern was replicated across the rest.

### 1. `e2e-fixtures.ts` was instantiated twice per server — the blocker

The create/delete spec failed. A probe showed `/api/plans` returning the same two seeded
plans *before and after* a create, while the RSC-rendered page saw the new one.

**Next bundles route handlers separately from page and Server Action code**, so
`lib/api/e2e-fixtures.ts` had two module instances with independent state: writes landed
in one copy, route-handler reads hit the other. Production is unaffected —
`createAppServices()` holds no state, it talks HTTP — but every module here moves reads
to route handlers, so it would have broken all six.

Fixed by backing all ten mutable fixture containers with a `globalThis`-keyed store.
ADR-0007 had already flagged this file's cross-module mutable state as a liability; this
is that bill arriving.

*Tested and ruled out:* the first hypothesis was `revalidatePath` in the Server Actions
racing TanStack's invalidation. Stripping it changed nothing, so it **stays** — the
"complementary, not duplicate" claim above holds.

### 2. Row-level mutation hooks must live in the parent

A `useMutation` that optimistically **removes** its own row cannot live in that row: the
optimistic write unmounts the component, destroying the hook and its error state, so a
failed delete rolls back silently. This is the same trap `useOptimistic` had — adopting
TanStack does not fix it by itself, only lifting the hook does.

`leads-admin-panel.tsx` therefore owns `useChangeLeadStatus` / `useDeleteLead` and passes
callbacks into `LeadEditRow`; the row keeps only `useUpdateLead`, which never removes it.

### 3. Shell-mode mutations keep `router.refresh()`

Creating a gym and accepting a staff invite change the session's gym affiliation, which
decides the Admin shell's `mode` (settings-only vs full) in
`app/(admin)/admin/layout.tsx`. **Cache invalidation cannot re-render a layout**, so those
stay on `router.refresh()` and the Settings *inbox* branch stays server-rendered; only the
gym-admin invite list is TanStack-owned. The same applies to the auth flows, which create
the session itself.

`router.refresh()` went from 22 call sites to 6. The remainder are principled: session
creation (`login-form`, `google-oauth-callback-client`), shell-mode changes
(`create-gym-form`, `staff-invite-inbox`), and the two CLIENT-persona screens
(`membership-invite-inbox`, `data-grants-panel`) which are outside this Admin migration.

## Consequences

- **`revalidatePath` stays** in the actions. It keeps hard navigation and RSC renders
  correct; TanStack invalidation handles the client cache. They are complementary, not
  duplicate.
- **New surface: read route handlers.** ~6 thin handlers whose only job is gate → shared
  query function → JSON. They call `createAppServices()`, so the
  `GYM_SAAS_E2E_FIXTURES` fakes keep working unchanged.
- **Rules to amend:** `001-tech-stack.mdc` (installed list + "not installed"),
  `state-management.mdc` tier 1 (server data now has a client cache; the "no SWR/React
  Query as default" line is reversed), `nextjs-app-router.mdc` (data & mutations).
  ADR-0009's streaming guidance survives intact.
- **More client JS.** Accepted deliberately: an internal admin tool trades bundle size
  for interaction quality, and the tables/filters here are exactly TanStack's sweet
  spot.
- **`staleTime` must be set deliberately.** The v5 default of `0` makes every mount
  refetch, which against a ~400ms backend would feel worse than today. Defaults get
  chosen in step 1, not per-hook.
- **Zod validation is unmoved** — still at the adapter boundary; route handlers return
  already-validated DTOs.
- Ports/adapters and the composition root are **untouched**. That layering is what
  makes this migration a change of transport rather than a rewrite.

## Alternatives considered

| Option | Why not |
|---|---|
| Stay RSC-only | Leaves the real problem unsolved: no durable cache on serverless, so every navigation re-pays every round trip. ADR-0009 exhausted the server-side options. |
| `use cache: remote` + Redis/KV | Solves caching server-side but adds infrastructure, cost, and latency, and still doesn't give optimistic rollback, prefetch-on-hover, or request dedup. |
| SWR instead | Lighter, but weaker mutation story — the optimistic/rollback ergonomics are the second-biggest motivation here. |
| Migrate one module and leave the rest RSC | Two data-fetching idioms in one codebase indefinitely; new contributors copy whichever they see first (the same failure ADR-0007 called out for lazy migrations). |
| Client-only fetching, drop RSC prefetch | Simpler mental model, but retires ADR-0009's streaming work and makes first paint a spinner. |
