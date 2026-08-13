# 2026-08-14 — Module-folder migration (ADR-0007)

Behavior-neutral relocation of 9 modules from the layer-first tree into
`lib/modules/<module>/`. `git mv` throughout, so history follows the files.

## What moved

- `lib/ports/`, `lib/api/*-adapter.ts`, `lib/features/*`, `lib/display/*` and the
  per-module UI out of `components/{admin,client,staff,onboarding,auth}/` →
  `lib/modules/<module>/` with `<module>-` prefixed filenames.
- `components/` now holds shared chrome only: `ui/`, `theme/`, and
  `admin/{admin-shell,admin-stub-page}.tsx`.
- `lib/features/admin/admin-nav.ts` (+test) → `lib/admin/` — it is UI chrome, not
  a module with ports.
- Tests stayed colocated and travelled with their module.

## Hotspots removed

- **`lib/api/composition.ts`: 158 → 35 lines.** Each module owns a
  `<module>-services.ts` binding its port to its adapter (or E2E fake); the root
  just spreads them. Adding a module is now one import + one spread.
- `endpoints.ts` split into `<module>-endpoints.ts`; only `health` stays shared.
  Each file keeps the export name `endpoints`, so call sites were untouched.
- `docs/PROGRESS.md` → one file per entry in `docs/progress/` (39 entries), so two
  contributors adding entries no longer collide.

## Enforcement re-pointed (the risky part)

`eslint.config.mjs` hardcoded `lib/ports/**` and `lib/features/**`; after the move
those globs would have matched nothing and the boundary would have stopped being
enforced **silently**. Rules are now filename-scoped (`lib/modules/*/*-ports.ts`,
`*-adapter.ts`, `*-services.ts`) and split into disjoint file sets, because flat
config resolves duplicate `no-restricted-imports` by last-match-wins rather than
merging.

Verified by deliberately injecting four violations — component→adapter,
port→adapter, action→http-client, adapter→use-cases. All four failed the lint as
intended, then were reverted.

## Deliberately not done

- **`e2e-fixtures.ts` stays central** (1173 lines). It holds cross-module mutable
  state (`seedMembershipSideEffects` spans membership-invites → roster →
  subscriptions), so it needs its own commit with a shared kernel.
- Module shape left non-uniform: `auth`, `gym-orgs`, `staff-invites` keep one file
  per use-case. The contract is naming and layering, not file count.
- Module ownership split — still an open decision, and deliberately not a
  prerequisite for this work.

## Verification

53 unit tests and 25 Playwright specs green **before and after**, unchanged.
`npm run verify` and `npm run build` pass. Docs updated in the same commit:
`architecture-plan.md` §4/§5/§9, ADR-0007 (status → implemented), rules
`001-tech-stack` / `code-quality` / `error-handling` / `security-data-access` /
`progress-log`, and the `implement-feature` skill.
