# 2026-08-14 — CI typecheck needs Next route types

GitHub Actions `typecheck` failed with `Cannot find name 'LayoutProps'` in
`app/layout.tsx`. Next 16 generates that global from `.next/types` (and
`next-env.d.ts`, which is gitignored). Local `next dev` had already written
those files; a clean CI checkout had not.

`npm run typecheck` now runs `next typegen` before `tsc --noEmit` so typed
route helpers exist without a full production build.
