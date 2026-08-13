---
name: orient
description: Orient before non-trivial Gym SaaS web work. Reads PROGRESS, architecture-plan, and narrow product docs.
---

# Orient

Run before non-trivial work.

## Steps

1. Read `docs/PROGRESS.md` → **Current stage** + **Next up**.
2. Note **persona** (`Admin` now; `Trainer` / `Client` later).
3. Read only the needed parts of `docs/architecture-plan.md` (§1 context, §4 layers, §5 folders, §6 routes; §7 auth; §8 grants).
4. Skim rules that apply: `nextjs-app-router.mdc`, `state-management.mdc`, `code-quality.mdc` (and others by file glob).
5. Task-scoped extras (pick one):

| Need | Read |
|---|---|
| Domain names | `docs/CONTEXT.md` |
| Product | `docs/PRD.md` / `docs/product-flows.md` |
| Auth API | `docs/api/client-auth.md` |
| Staff invites | `docs/api/staff-invites.md` |
| Postman sync | `docs/postman-sync.md` |
| Theme | `docs/ui-theme.md` |

6. Prefer **Current stage** over assuming features. Staff first-run = **Settings** (`/admin/settings`), not create-gym.
7. Libs (Next/Zustand/Zod/Playwright/…) → **Context7 MCP**.
8. API work → sibling `gym-backend-postman` + **sync-postman-collection** / **verify-api-flow** — never invent endpoints.
9. After a chunk → update `docs/PROGRESS.md`.
10. Do not dump every doc into context.

## Skip when

- Pure Cursor/rules meta with no product change
- Already oriented this session and PROGRESS unchanged
