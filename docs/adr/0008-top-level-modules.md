# ADR-0008: Top-level `modules/` — `lib/` is shared infrastructure only

**Status:** Accepted — **implemented** 2026-08-14
**Date:** 2026-08-14
**Amends:** ADR-0007 and `docs/architecture-plan.md` §4, §5, §8, §9

## Context

ADR-0007 colocated each domain slice under `lib/modules/<module>/`. Colocation
was the right move; the parent folder was not. `lib/` reads as shared helpers
(HTTP kernel, session, `cn()`, theme tokens). A module is the product, not a
library. Parking nine vertical slices there also left a name collision:
`lib/auth/` (session cookie) vs `lib/modules/auth/` (OTP / Google / lane).

`lib/admin/admin-nav.ts` was the remaining non-infrastructure file in `lib/` —
it is Admin chrome, same as `admin-shell.tsx`.

## Decision

1. Promote `lib/modules/*` to top-level `modules/*`. File names and layering
   inside each module are unchanged (`<module>-ports.ts`, `-adapter.ts`,
   `-services.ts`, `components/`, …).
2. `lib/` holds **shared infrastructure only**: `api/` (HTTP kernel +
   composition root), `auth/` (session), `theme/`, `utils.ts`.
3. Move `admin-nav.ts` (+ test) to `components/admin/`.
4. Product and architecture docs stay in `docs/` — no per-module doc trees.

**Composition-root exception:** `lib/api/composition.ts` imports from
`modules/*`. That is inherent to a DI root and was already true under
ADR-0007. It is the one sanctioned “upward” dependency; ESLint continues to
allow it.

## Consequences

- Import prefix `@/lib/modules/` → `@/modules/`. No `tsconfig` change (`@/*`
  already maps to the repo root).
- ESLint boundary rules, Vitest includes, and Cursor rule globs re-point to
  `modules/**` so enforcement does not silently drop off.
- Historical ADR-0007 and its progress entry are left as they were — they
  describe the tree at that moment.

## Alternatives rejected

- Leave `lib/modules/` — the folder still says “library”.
- Hoist `lib/api/` and `lib/auth/` to the top level as well — over-scatters
  infrastructure that is not a product module.
- Per-module `docs/` folders — `docs/` remains the single SSOT.
