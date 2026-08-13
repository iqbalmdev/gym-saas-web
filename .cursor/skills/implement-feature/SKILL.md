---
name: implement-feature
description: Implement one Gym SaaS web vertical slice (Admin, Trainer, or Client) with ports/adapters and correct state tiers.
---

# Implement feature

## Preconditions

1. Run **orient**.
2. Name persona + module + one slice outcome.
3. Fit plan §5–§6 folders/routes (or note ADR exception).
4. Keep out-of-MVP items out (plan §13).
5. **Choose state tier** (rule `state-management.mdc`) before coding UI.

## Workflow

1. **Align** — PRD/flow bullets that apply; ask if ambiguous.
2. **Slice** — one vertical cut only.
3. **Server data** — Server Component reads via **ports**; HTTP only in `lib/api` adapters. Wire at composition root.
4. **Mutations** — Server Actions → use-case → adapter → `revalidatePath` / `redirect`. No domain `fetch` in client JSX.
5. **Client UI** — presentational leaves; theme tokens; calm empty/loading/error/grant-missing.
   - One form → `useState` / `useTransition`.
   - Shareable filters → URL `searchParams`.
   - Shared chrome across trees → Zustand (`createStore` + provider); **never** store API entities.
6. **M2 Staff** — create gym + staff invites on `/admin/settings` (Settings-only when 0 gyms). Invitee inbox = Accept only; Revoke = Admin gym panel.
7. **Verify** — unit (port fakes) / Playwright / **verify-api-flow**. Sync Postman if contract may have moved.
8. **Progress** — update `docs/PROGRESS.md`.

## Done

- [ ] State tier chosen deliberately (not default global store)
- [ ] CONTEXT terms · ports/adapters · no fetch in JSX
- [ ] DataGrant / billing≠access honored
- [ ] No Admin-only dead ends for future personas
- [ ] `docs/PROGRESS.md` updated
