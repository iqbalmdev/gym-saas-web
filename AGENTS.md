# AGENTS.md

Gym SaaS Next.js web — **Admin-first**.

## Start here

1. Skill **orient** → `docs/PROGRESS.md` + needed `architecture-plan` sections.
2. Implement via **implement-feature** (ports/adapters + state tier).
3. API: **sync-postman-collection** / **verify-api-flow** — sibling `gym-backend-postman`, not `postman/` in this repo.

Docs index: `docs/README.md`.

## Rules (`.cursor/rules`)

Cursor auto-loads the **always-on** rules below. **Claude Code does not read
`.mdc` files** — if you are Claude Code, read the always-on rules at session
start, and the glob-scoped ones when you touch matching files.

| Rule | Load | Focus |
|---|---|---|
| `000-project-context.mdc` | always | Surfaces, lanes, tenancy, domain non-negotiables |
| `001-tech-stack.mdc` | always | Locked versions; what is **not** installed |
| `code-quality.mdc` | always | SOLID / ports / DI / style |
| `git-conventions.mdc` | always | Commits, branches, PR contents |
| `security-data-grants.mdc` | always | DataGrants, billing ≠ access |
| `postman-sync.mdc` | always | Sibling repo is API SSOT |
| `context7-docs.mdc` | always | Library docs before inventing APIs |
| `architecture.mdc` | glob | Settings-first, folders, no invent endpoints |
| `nextjs-app-router.mdc` | glob | RSC default, Server Actions, client leaves |
| `state-management.mdc` | glob | Server data vs useState vs URL vs Zustand (UI only) |
| `security-data-access.mdc` | glob | Auth → lane → tenant → grant gate on Server Actions |
| `error-handling.mdc` | glob | Calm errors; typed action results |
| `testing.mdc` | glob | Vitest port fakes + Playwright POM |
| `ui-theme.mdc` | glob | Semantic tokens only |
| `progress-log.mdc` | always | Stage in `docs/PROGRESS.md`; log entries in `docs/progress/` |

## Skills (`.cursor/skills`)

| Skill | When |
|---|---|
| `orient` | Task start |
| `implement-feature` | Vertical slice (any persona) |
| `implement-admin-feature` | Alias → Admin |
| `sync-postman-collection` | Sibling pull → Postman cloud |
| `verify-api-flow` | OTP → Bearer → endpoint |
| `playwright-e2e-testing` | UI E2E |
| `bootstrap-agent-os` | New empty repo only |

Matt Pocock skills live under `.agents/skills` (`/grill-with-docs`, `/tdd`, …).

## Posture

- Settings-first Staff (0 gyms → `/admin/settings`).
- Never invent API endpoints.
- Never put API entities in Zustand.
- Showcase: https://prd-showcase.vercel.app/

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
