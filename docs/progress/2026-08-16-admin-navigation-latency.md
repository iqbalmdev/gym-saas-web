# 2026-08-16 — Admin navigation latency: stream the shell, kill the full-page filter reload

Reported symptom: *"click Plans in the sidebar, it takes some time, then the skeleton
shows up, then the data; then click a filter and the page loads again."* Two separate
bugs plus one irreducible cost. Full analysis and rejected alternatives in
**ADR-0009**.

## Measured first

`getApiBaseUrl()` falls back to the deployed backend and there is no `.env.local`, so
dev talks to the remote Vercel API. `/health` (no DB work) from a dev machine:
`ttfb 0.454s · 0.390s · 0.437s`. Every call also sets `cache: 'no-store'`. That ~400ms
floor is what both bugs were multiplying.

## Bug 1 — the shell blocked on the gym lookup

`listStaffGymOrgs()` sat above the `<Suspense>` boundary on all five ops pages (the
header printed `{gym.name}`), so nothing painted — not even the skeleton — until it
resolved. Layouts don't re-render on soft navigation, and React `cache()` dedupes only
within a request, so this ran on every navigation.

- Moved the gym lookup into each `<Module>Data` component, inside the boundary:
  `attendance-data.tsx`, `leads-data.tsx`, `members-data.tsx`, `plans-data.tsx`,
  `renewals-data.tsx`. Page shells now await only `getSession()` + `searchParams`.
- Added `loading.tsx` for `attendance`, `crm`, `members`, `plans`, `renewals`, and
  `settings`, reusing the existing panel skeletons plus a new
  `components/admin/page-header-skeleton.tsx`. Next prefetches these, so the sidebar
  click paints instantly. The ops dashboard is static and needs none.
- **Removed the gym-name eyebrow** above each ops `<h1>` — it was the sole reason the
  shell needed the gym, and `AdminShell` already shows the gym in the sidebar.

## Bug 2 — filter tabs were raw `<a href>`

Plan-kind and lead-status filters used raw anchors, so every filter click was a full
document navigation: tear down the SPA, re-request the HTML, re-download and re-hydrate
the bundle, then redo both API calls. The tabs also sat *inside* the data boundary, so
they disappeared into the skeleton while loading.

- Extracted `components/admin/filter-tabs.tsx` (`<Link>`, `aria-current`, `<nav>`
  landmark) and rendered it in the page shell **above** the boundary, so tabs stay put
  and clickable while the new list streams.
- Plans `<Suspense>` is keyed on the filter, so switching shows the skeleton instead of
  silently holding the previous filter's rows.

## Optimistic mutations (same pass)

Row actions now update before the Server Action resolves, via React 19 `useOptimistic`,
instead of waiting on `router.refresh()`:

- `attendance-admin-panel.tsx` — desk-mark prepends the row immediately.
- `plans-admin-panel.tsx` — activate/deactivate and delete.
- `leads-admin-panel.tsx` — status change and delete. Row-action errors are surfaced by
  the **parent**, not the row: a failed delete reverts the optimistic removal, which
  remounts the row as a fresh instance and would drop any local error state.

Create flows still use `router.refresh()` — going optimistic there means synthesising a
full entity client-side (temp id, `gymOrgId`, timestamps), which is a different change.

## Tests

- New `e2e/crm.spec.ts` + `e2e/pages/crm.page.ts` — capture, status change, delete.
- New `e2e/plans.spec.ts` + `e2e/pages/plans.page.ts` — activate/deactivate (restores
  state), create + delete, and a **soft-navigation regression test**: a `window` probe
  that survives client-side navigation and is wiped by a document reload. Verified it
  actually fails against a reverted raw-`<a>` implementation before keeping it.
- Both registered in `e2e/fixtures/pages.fixture.ts`.

Verified: `npm run verify` (format, lint `--max-warnings=0`, typecheck, 59 unit tests)
plus `next build` and the full Playwright suite — **30/30 green**.

## Also fixed: Select triggers showed raw enum codes

Base UI's `Select.Value` has no automatic value→label lookup; without a `children`
render-prop it renders `String(value)`. Every closed trigger in the app showed the raw
enum (`CONTACTED`) while the open dropdown showed the label (`Contacted`). Fixed all
eight usages — attendance member picker, members base/add-on plan and both payment
selects, plan kind, lead status, staff role — each mapped through its existing
`*-labels.ts` helper (plan kind uses a local helper matching the create form's fuller
copy).

## Deferred — the remaining ~800ms

Time-to-first-paint is now independent of backend latency; time-to-data is not.
`listStaffGymOrgs` → list is still two sequential round trips. ADR-0009 records why the
obvious fixes were rejected:

- `unstable_cache` — deprecated in Next 16.
- `use cache` + `cacheComponents` — the bundled docs say serverless cache entries
  "typically don't persist across requests"; this app deploys to Vercel, so it would
  buy ~nothing in production without a Redis/KV handler. Enabling it is also a large
  migration (PPR default, `<Activity>` navigation, every `cookies()` read into
  `<Suspense>`).
- Gym id in the session cookie — **blocked**: `encodeSession()` is unsigned
  `base64url(JSON)`, so trusting `gymOrgId` from it would violate the tenancy rule in
  `000-project-context.mdc`. Needs HMAC signing first (Node built-in `crypto`, no new
  dependency, but a server secret).
