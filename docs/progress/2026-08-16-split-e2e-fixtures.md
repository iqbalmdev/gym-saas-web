# 2026-08-16 — Split `lib/api/e2e-fixtures.ts` into a kernel + per-module fakes

Closes the ADR-0007 consequence ("`e2e-fixtures.ts` was deliberately left central
(1173 lines) … decomposing it belongs in its own commit"). ADR-0011 made it urgent: the
file had also become the app's only piece of **process-global mutable state**.

## Before

One 1132-line module holding nine adapter factories plus every mutable container, edited
by any feature that touched fixtures — a guaranteed conflict point for parallel work.

## After

| File | Lines | Role |
|---|---|---|
| `lib/api/e2e/store.ts` | 234 | constants, tokens, the ten `globalThis`-backed containers, `sampleInvite`, `isoDateOffset`, `seedMembershipSideEffects` |
| `modules/<m>/<m>-e2e-fixtures.ts` × 9 | 49–209 | one adapter factory each |

Each `<m>-services.ts` now imports `areE2eFixturesEnabled` from the kernel and its
factory from its own module, so adding or changing a fake touches **one module folder**
instead of the shared file.

## Why the state stayed central

`seedMembershipSideEffects` is genuinely cross-module — accepting a membership invite
creates a roster member, a subscription and a DataGrant. That fan-out is the domain's
shape, not an accident of the file, so it lives in the kernel rather than being
duplicated into three modules. What got split is the **behaviour** (factories); what
stayed shared is the **state**, which is the honest boundary.

The `globalThis` backing (ADR-0011) is unchanged and still required: Next bundles route
handlers separately from page/Server-Action code, so plain module state would give the
two entry points different copies.

## Boundaries

`eslint.config.mjs` — the `transport-stays-in-adapters` block now restricts
`@/lib/api/e2e/*` and `@/modules/*/*-e2e-fixtures` (was the single old path), and exempts
`modules/*/*-e2e-fixtures.ts` so the fakes may read the kernel. Nothing outside a
`*-services.ts` can reach a fixture.

## Verified

`npm run verify` (format, lint `--max-warnings=0`, typecheck, 64 unit tests),
`next build`, and the full Playwright suite **30/30 with no spec edits** — the meaningful
signal here, since every one of those specs runs entirely on these fixtures.
