# ADR-0007: Module-folder architecture (vertical slice colocation)

**Status:** Accepted — **implemented** 2026-08-14
**Date:** 2026-08-14
**Amends:** `docs/architecture-plan.md` §5 (folder structure), updated in the
migration commit so the documented tree and the real tree never disagree.

## Context

The tree is layer-first: `lib/ports/`, `lib/api/`, `lib/features/`, `lib/display/`,
`components/<persona>/`, `app/`. Measured today, one module spans **3–6 directories**:

| Module | Files | Directories |
|---|---|---|
| attendance | 8 | 6 |
| plans | 7 | 5 |
| roster | 7 | 5 |
| membership-invites | 9 | 5 (across two personas) |
| staff-invites | 10 | 4 |

Two consequences now matter, because a second contributor has joined:

1. **Ownership is not expressible.** "Nafil owns Plans, Iqbal owns Attendance" still has
   both editing `lib/ports/`, `lib/api/`, `lib/display/` and `components/admin/` on every
   feature. Git understands directories, not intentions.
2. **Three files are edited by every feature** — `lib/api/composition.ts`,
   `lib/api/e2e-fixtures.ts`, `lib/api/endpoints.ts`, each touched by **5 of 5** feature
   commits. Parallel work conflicts by construction.

## Decision

Adopt a **hybrid module-folder model**: domain slices colocate; genuinely shared
infrastructure stays global.

```text
lib/
  modules/<module>/
    <module>-ports.ts        # interfaces + DTOs
    <module>-adapter.ts      # HTTP + Zod   (+ adapter.test.ts)
    <module>-use-cases.ts    # depends on ports only
    <module>-actions.ts      # "use server" gate → use-case
    <module>-display.ts      # labels + error copy
    <module>-endpoints.ts    # this module's paths
    <module>-services.ts     # this module's port → adapter binding
    components/     # admin/ + client/ when multi-persona
  api/
    client.ts errors.ts   # HTTP kernel (shared)
    composition.ts        # spreads module services
  auth/ theme/            # cross-cutting
components/
  ui/                     # shadcn primitives — global, no business logic
  admin/                  # shell, nav, chrome only
app/                      # routes, thin composition
```

### What stays global, and why

- **`app/`** — Next.js owns routing; routes cannot live inside modules. Pages become
  thin composition over module UI.
- **`components/ui/`** — the shadcn CLI writes there (ADR-0006).
- **HTTP kernel + composition root** — shared by definition.

### Preserving the dependency rule

Layer-first made DIP (ADR-0004) visible in the tree. Colocation preserves it by making
**filenames** the layer: `<module>-ports.ts` never imports `<module>-adapter.ts` in any
module. This is enforced by filename-scoped `no-restricted-imports` in
`eslint.config.mjs` — a stronger guarantee than relying on authors noticing which
folder they are in, because it fails the build.

Note on flat config: when two config blocks set `no-restricted-imports` for the same
file, the last match wins outright rather than merging. The rules are therefore split
into **disjoint file sets** (ports · adapters · everything-above), not one block per
concern.

### Hotspot resolution

Each module exposes its own `services.ts`, so the composition root collapses to one
import and one spread per module:

```ts
export function createAppServices() {
  const http = createHttpClient({ baseUrl: getApiBaseUrl() });
  return { ...plansServices(http), ...rosterServices(http) /* … */ };
}
```

Adding a module becomes a two-line diff in one shared file instead of ~20 lines across
three. `docs/PROGRESS.md` is separately split into one file per entry under
`docs/progress/` for the same reason.

Naming: `lib/features/` → `lib/modules/` aligns with the M1–M13 language already used
in the PRD, docs, and commit scopes (`feat(m4-plans)`).

## Sequencing

1. Repair rules + agent parity — **done**
2. Tooling + CI (ADR-0006) — **done**
3. **This migration**, as a single commit — **done**
4. shadcn + token aliasing (ADR-0006)
5. Tailwind canonical classes, after shadcn settles the markup
6. Split module ownership between contributors, then parallel feature work

Landing it before shadcn avoided moving the same files twice, and it was cheapest at
9 modules. Ownership split was **not** a prerequisite — the structural payoff
(hotspot removal, colocation) stands on its own.

### Outcome

- `lib/api/composition.ts`: **158 → 35 lines**; adding a module is now one import
  plus one spread.
- `endpoints.ts` split per module; only `health` remains shared.
- Behavior-neutral: 53 unit tests and 25 Playwright specs green before and after.
- `e2e-fixtures.ts` deliberately left central — see below.

## Consequences

- Three files remain shared and will still occasionally collide: `composition.ts`
  (now trivially — two lines per module), `lib/admin/admin-nav.ts`, and
  `lib/api/e2e-fixtures.ts`. A nav is a shared list by nature — accepted.
- **`e2e-fixtures.ts` was deliberately left central** (1173 lines). It holds genuine
  cross-module mutable state — shared token `Set`s, and `seedMembershipSideEffects`
  which writes across membership-invites → roster → subscriptions — so it does not
  split cleanly per module. Each `<module>-services.ts` imports its own fake from it.
  Decomposing it belongs in its own commit, where a broken fake is obvious rather
  than buried in a 100-file diff. Until then it stays a (minor) hotspot.
- Module shape is **not** uniform, and that is allowed: `auth`, `gym-orgs` and
  `staff-invites` keep one file per use-case. The contract is the naming and the
  layering, not a fixed file count.
- `architecture-plan.md` §5 was updated in the same commit, so the documented tree
  and the real tree never disagree.

## Alternatives considered

| Option | Why not |
|---|---|
| Keep layer-first | Ownership inexpressible; three guaranteed conflict files per feature |
| Pure module folders (routes inside modules) | Impossible — Next.js owns `app/` |
| Split by layer between contributors (one does UI, one does adapters) | Collides on every feature and splits each slice across two reviewers |
| Migrate lazily, module by module as touched | Two structures coexist for months; agents copy whichever they see first |
