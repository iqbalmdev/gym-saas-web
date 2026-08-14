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

## Module layout (ADR-0007 / ADR-0008)

Everything for a slice lives in **one folder**, `modules/<module>/`:

```
<module>-ports.ts       interfaces + DTOs      <module>-errors.ts    calm copy
<module>-adapter.ts     HTTP + Zod (+ .test)   <module>-labels.ts    (if needed)
<module>-endpoints.ts   this module's paths    <module>-services.ts  port → adapter
<module>-use-cases.ts   depends on ports only  components/           module UI
<module>-actions.ts     "use server" gate
```

Existing module? Add to it. New module? Create the folder, then add **one import +
one spread** to `lib/api/composition.ts` — that is the only shared file you touch.
`auth`, `gym-orgs` and `staff-invites` keep one file per use-case; that is fine.

Tests stay **colocated** next to what they test.

## Workflow

1. **Align** — PRD/flow bullets that apply; ask if ambiguous.
2. **Slice** — one vertical cut only.
3. **Server data** — Server Component reads via **ports**; HTTP only in
   `<module>-adapter.ts`. Bind in `<module>-services.ts`; resolve via
   `createAppServices()`.
4. **Mutations** — Server Actions (`<module>-actions.ts`) → use-case → adapter →
   `revalidatePath` / `redirect`. No domain `fetch` in client JSX.
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
