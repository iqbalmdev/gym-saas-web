# AGENTS.md

Gym SaaS Next.js web — **Admin-first**.

## Start here

1. Skill **orient** → `docs/PROGRESS.md` + needed `architecture-plan` sections.
2. Implement via **implement-feature** (ports/adapters + state tier).
3. API: **sync-postman-collection** / **verify-api-flow** — sibling `gym-backend-postman`, not `postman/` in this repo.

Docs index: `docs/README.md`.

## Rules (best practices)

| Rule | Focus |
|---|---|
| `nextjs-app-router.mdc` | RSC default, Server Actions, client leaves |
| `state-management.mdc` | Server data vs useState vs URL vs Zustand (UI only) |
| `code-quality.mdc` | SOLID / ports / DI |
| `architecture.mdc` | Settings-first, folders, no invent endpoints |
| `testing.mdc` | Vitest port fakes + Playwright POM |

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
