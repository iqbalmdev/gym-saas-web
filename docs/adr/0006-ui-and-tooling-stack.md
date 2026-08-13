# ADR-0006: UI component library and tooling stack

**Status:** Accepted
**Date:** 2026-08-14
**Context:** Second contributor joining; stack questions raised after the `e537810` rule drift.

## Context

The repo gained a second contributor, and most work is agentic. Commit `e537810`
imported a rule bundle describing a **different** application (Next 15, React Query,
react-hook-form, direct Supabase reads, `lib/hooks/`, `lib/permissions/`). Nothing in
the repo could detect the contradiction, so it sat unnoticed. The rules have been
repaired; this ADR records the stack decisions explicitly so the next change is
visible rather than silent.

Four questions were open: client-side data fetching, form library, component
library, and commit/CI tooling.

## Decisions

### 1. shadcn/ui — adopt

`components/ui/` holds two hand-rolled primitives (`button`, `empty-state`). Admin ops
screens need data tables, dialogs, sheets, dropdowns, comboboxes and toasts. shadcn is
copy-in source we own, which suits this repo better than a component dependency.

Integration constraints:

- Keep the existing `html[data-theme]` switch. In Tailwind 4, point shadcn's dark
  variant at it: `@custom-variant dark (&:is([data-theme="dark"] *));`
- Do **not** rewrite `lib/theme/crm-tokens.css`. Alias shadcn's expected variable names
  (`--background`, `--foreground`, `--primary`, `--muted`, `--ring`, …) onto the existing
  semantic tokens (`--color-canvas`, `--color-surface`, `--color-accent`,
  `--color-fg-muted`, …). Retheming stays a token-map swap (`docs/ui-theme.md`).
- `components/ui/` stays global and business-logic free — the shadcn CLI writes there.
- Accepts **`@base-ui/react`** runtime dependencies (recent shadcn switched away
  from Radix) and introduces `cn()` (clsx + tailwind-merge). `init` also installs
  `shadcn` itself as a runtime dep — move it to devDependencies, it is a CLI.

### 2. Tailwind CSS 4 — already in use, unchanged.

### 3. Prettier + ESLint + Husky + lint-staged + CI — adopt

- Prettier with `prettier-plugin-tailwindcss` for class sorting.
- ESLint extended beyond the bare Next defaults to encode architecture rules
  mechanically (no default exports, no domain `fetch` in client components, no adapter
  imports outside the composition root, no cross-module imports).
- Husky + lint-staged for fast local feedback.
- **CI is the enforcement boundary**, not Husky — hooks are bypassable with
  `--no-verify` and only exist on machines that installed them. CI runs `typecheck`,
  `lint`, `test`, `test:e2e` on pull requests.

### 4. TanStack Query — deferred

**Not adopted.** The session access token is in an **httpOnly** cookie (ADR-0005),
readable only server-side via `next/headers`. Browser JS cannot obtain a Bearer token,
so client-side TanStack Query cannot authenticate against the Express API. Adopting it
would require either:

- exposing the access token to client JS — rejected, it is a Bearer for the whole API
  and breaks ADR-0005; or
- BFF route handlers under `app/api/*` proxying **29 endpoints**, duplicating
  `lib/api/endpoints.ts`. `architecture-plan.md` §5 already gates `app/api/` behind an ADR.

RSC + Server Actions + `revalidatePath` covers current needs with no token exposure and
no client bundle cost.

**Note on precedent:** the pattern works in our sibling *casheq* project because its
browser talks directly to Supabase holding a legitimate client session, with **RLS** as
the security boundary. Gym SaaS has no such property — its boundary is a server-side
Bearer against Express (S3), and the web app owns no domain logic. The pattern does not
port.

**Revisit when** a surface genuinely needs client-side polling (live attendance feed),
infinite scroll on a large roster, or optimistic UI. Adopt per-surface behind a BFF,
with its own ADR — not repo-wide.

### 5. TanStack Form — deferred

Would work (forms post to Server Actions, so the cookie constraint does not apply), but
is not yet justified. Current forms — OTP steps, create gym, invite, plan, lead — are
handled by `useState` + `useTransition` + typed action results. Revisit at the first
genuinely complex form; multi-line subscription assignment is the likely trigger.

## Consequences

- `001-tech-stack.mdc` lists the not-installed libraries explicitly, so an agent
  reaching for React Query or react-hook-form is contradicting a rule rather than
  filling a vacuum.
- Adding shadcn is the first change to introduce runtime UI dependencies; the
  "ask before adding a dependency" rule in `code-quality.mdc` is considered satisfied
  for shadcn/Radix by this ADR.
- Deferring TanStack Query keeps all domain transport server-side, preserving the
  ports/adapters boundary (ADR-0004) unchanged.

## Alternatives considered

| Option | Why not |
|---|---|
| Adopt TanStack Query repo-wide now | Requires exposing tokens or a 29-endpoint BFF; replaces a working pattern |
| Build our own table/dialog primitives | Weeks of work; shadcn is copy-in and owned |
| Adopt shadcn's `.dark` class + its token names | Discards a working FOUC-safe `data-theme` system and the retheme property |
| Husky only, no CI | Bypassable and machine-local; would not have caught `e537810` |
