# ADR-0007: Module-folder architecture (vertical slice colocation)

**Status:** Accepted — **implementation deferred**
**Date:** 2026-08-14
**Amends:** `docs/architecture-plan.md` §5 (target folder structure), once implemented.

> ⚠️ **This structure does not exist yet.** Until the migration lands,
> `architecture-plan.md` §5 and the current tree remain authoritative. Do not
> implement features against the target shape below, and do not "helpfully" create
> `lib/modules/` ahead of the planned move — a documented structure that contradicts
> the code is exactly the failure this repo just recovered from (`e537810`).

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
**filenames** the layer: every module has the same files, and `ports.ts` never imports
`adapter.ts` in any module. This is enforceable with per-directory
`no-restricted-imports` (ADR-0006 §3) — a stronger guarantee than relying on authors
noticing which folder they are in.

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

## Sequencing (why implementation is deferred, not abandoned)

The move is ~100 files, mechanical, with no behavior change — but it touches nearly
everything, so it conflicts with any concurrent work. Required order:

1. Repair rules + agent parity — **done**
2. Tooling + CI (ADR-0006)
3. **This migration**, as a single commit, while only one person is in the tree
4. Split module ownership between contributors
5. Parallel feature work

Doing it before shadcn avoids moving the same files twice, and it is cheapest now
(9 modules) than at any later point. Definition of done: `typecheck`, all unit tests,
and the Playwright suite green before and after, with no behavior change in the diff.

## Consequences

- Two files remain shared and will still occasionally collide: `composition.ts` (now
  trivially) and the admin nav. A nav is a shared list by nature — accepted.
- `e2e-fixtures.ts` is the fiddliest part of the split; its single fake set must be
  decomposed per module without breaking `GYM_SAAS_E2E_FIXTURES`.
- `architecture-plan.md` §5 must be updated **in the same commit** as the migration, so
  the documented tree and the real tree never disagree.

## Alternatives considered

| Option | Why not |
|---|---|
| Keep layer-first | Ownership inexpressible; three guaranteed conflict files per feature |
| Pure module folders (routes inside modules) | Impossible — Next.js owns `app/` |
| Split by layer between contributors (one does UI, one does adapters) | Collides on every feature and splits each slice across two reviewers |
| Migrate lazily, module by module as touched | Two structures coexist for months; agents copy whichever they see first |
