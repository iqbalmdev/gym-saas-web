# UI theme direction (swappable)

> **Rules live in [`ui-design-system.md`](ui-design-system.md)** — which token for which
> job, the status-badge scale, density, and empty-state copy. This file covers the
> *direction* and the light/dark mechanics.

**Status:** CRM token themes with light/dark (`data-theme`). Collapsible sidebar (icon rail ↔ labels). Feature modules still stub panels.

## Default direction (v0)

Soft light **CRM / operations** Admin shell (reference mood: light gray-blue canvas, white panels, high-contrast active states, calm tables/pipelines):

- Canvas: soft cool gray/blue (e.g. near `#F4F7F9`)
- Surfaces: white panels, large radius, light elevation
- Active nav / primary actions: high-contrast dark (near black) — not loud purple/indigo gradients
- Status pills: quiet semantic colors (e.g. blue = executed/info, amber = scheduled/warning)
- Density: operational (tables, pipelines, inboxes) — not marketing landing pages

## Light / dark

- Tokens live in `lib/theme/crm-tokens.css` (`:root` / `html[data-theme="light"]` and `html[data-theme="dark"]`).
- Preference stored in `localStorage` key `gym-saas-theme` (`light` | `dark`). First visit follows system preference.
- Boot script in root layout sets `data-theme` before paint (no flash). Toggle: header + drawer + login.

## Non-goals for v0 theme

- Purple-on-white / purple-indigo AI-default gradients
- Glassmorphism-heavy decoration that fights readability
- Cards-for-everything; prefer clear sections and tables for Admin ops

## Implementation rules (when UI starts)

1. Define semantic CSS variables (`--color-canvas`, `--color-surface`, `--color-accent`, `--radius-panel`, etc.).
2. Components consume tokens only — never raw hex in feature JSX.
3. Switching theme = swap token map via `data-theme`, not rewriting pages.
4. Brand mark (product name) should be clear in the Admin chrome; features stay calm and medical/ops-grade trustworthy.

## Product UI constraints (from PRD)

- English-only MVP
- Missing DataGrant → calm empty state, not fake data
- Billing badges visible; unpaid does not lock access in UI copy
