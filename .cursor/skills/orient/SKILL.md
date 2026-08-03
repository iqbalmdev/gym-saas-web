---
name: orient
description: Orient before non-trivial work on Gym SaaS web. Use at task start for features, bugs, refactors, or docs. Reads Current stage, architecture plan, and narrow product docs for Admin, Trainer, or Client.
---

# Orient

Run before non-trivial work in this repo.

## Steps

1. Read `docs/PROGRESS.md` → **Current stage** and **Next up**.
2. Note which **persona** the task targets (`Admin` now; `Trainer` / `Client` when those phases start).
3. Read the relevant sections of **`docs/architecture-plan.md`** (build contract). At minimum: system context (§1), layers / SOLID-DI (§4), folder map (§5), and the module/route you will touch (§6). For auth work also §7; for member/progress UI also §8.
4. Task-scoped reads only (pick what applies):

| Topic | Read |
|---|---|
| Architecture (full) | `docs/architecture-plan.md` |
| Architecture (short) | `docs/architecture.md` |
| Domain language / naming | `docs/CONTEXT.md` |
| Product behavior | `docs/PRD.md` (relevant M#) |
| Screens / journeys | `docs/product-flows.md` |
| Visual tokens | `docs/ui-theme.md` |
| MCP / tooling | `docs/mcp-setup.md` |
| AI methodology | `docs/ai-development-playbook.md` |
| Schema (when present) | `docs/schema.dbml` or API contract docs |

5. Prefer **Current stage** and the architecture plan over assuming features or alternate layouts exist.
6. If the task touches Next.js, Zod, Playwright, React, Tailwind, or other libraries, use **Context7 MCP** for current docs (rule `context7-docs.mdc`).
7. If **Next up** conflicts with the user request, prioritize the user and note the deferral.
8. After a meaningful chunk, update `docs/PROGRESS.md` per `.cursor/rules/progress-log.mdc`.
9. Do not dump every doc into context — read narrowly.

## Skip orient only when

- Pure meta questions about Cursor/rules/MCP with no product or architecture change
- Already oriented this session and `PROGRESS.md` / architecture plan have not changed
