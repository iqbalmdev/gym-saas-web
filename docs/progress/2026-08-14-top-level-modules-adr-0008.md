# 2026-08-14 — Top-level `modules/` (ADR-0008)

Behaviour-neutral relocation: `lib/modules/<module>/` → `modules/<module>/`,
and `lib/admin/admin-nav.ts` (+ test) → `components/admin/`. `git mv`
throughout so history follows the files.

`lib/` is now shared infrastructure only (`api/`, `auth/` session, `theme/`,
`utils.ts`). Product docs stay in `docs/`.

Enforcement re-pointed: ESLint filename-scoped globs, Vitest `include`, and
Cursor rule frontmatter. Imports rewritten `@/lib/modules/` → `@/modules/`.

Historical ADR-0007 / its progress entry were not edited.
