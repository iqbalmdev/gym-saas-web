---
name: implement-feature
description: Implement one Gym SaaS web vertical slice for Admin, Trainer, or Client against the architecture plan and PRD/product-flows. Use when building or changing a web feature for any persona.
---

# Implement feature (any persona)

## Preconditions

1. Run **orient** (PROGRESS + relevant `docs/architecture-plan.md` sections).
2. Name **persona** (`Admin` | `Trainer` | `Client`) + module (e.g. M4 renewals) + single slice outcome.
3. Confirm the slice fits plan §5 folders and §6 route map (or note an ADR-needed exception).
4. Confirm out-of-MVP items stay out (plan §13).
5. Prefer shared `lib/*` and `components/ui`; persona UI under matching folder/route group.

## Workflow

1. **Align** — Quote PRD/flow + architecture-plan bullets that apply; list open decisions. If ambiguous, ask or `/grill-with-docs` before coding.
2. **Slice** — One vertical slice only (e.g. list + empty state, not full CRM).
3. **Types & API** — Use-cases depend on **ports**; HTTP only in `lib/api` adapters (ADR-0004 / plan §4). No entitlement logic or `fetch` in JSX (plan §8).
4. **UI** — Presentational components; theme tokens; calm empty/loading/error/grant-missing states.
5. **Verify** — Postman MCP / Playwright MCP / `verify-api-flow` as appropriate.
6. **Review bar** — Plan §12 compliance checklist (includes DIP).
7. **Progress** — Update `docs/PROGRESS.md`.

## Persona notes

- **Admin (current focus):** renewals, CRM, desk attendance, roster, plans — Phase A order in plan §6.
- **Trainer / Client (future):** reuse auth + API + theme; do not invent a second Next app without an ADR.

## Done checklist

- [ ] Matches `docs/CONTEXT.md` terms
- [ ] Matches `docs/architecture-plan.md` layers, ports/adapters, folders
- [ ] SOLID/DI: no transport or domain formatting buried in JSX
- [ ] Honors DataGrant / billing≠access rules
- [ ] Does not paint the codebase into Admin-only corners
- [ ] No raw theme hex in feature components
- [ ] `docs/PROGRESS.md` updated
