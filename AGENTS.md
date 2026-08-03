# AGENTS.md

Guidance for AI agents in **gym-saas-web** (Gym SaaS Next.js — Admin-first).

## Product posture

- Admin-first web; Trainer/Client web later in the same app.
- Build contract: `docs/architecture-plan.md` (ADR-0003). SOLID/DI: ADR-0004.
- Read `docs/PROGRESS.md` before non-trivial work; start with skill **orient**.
- Backend auth: `docs/api/client-auth.md`. Postman: `postman/` + skill **verify-api-flow**.
- Methodology: `docs/ai-development-playbook.md` · Getting started: `docs/GETTING-STARTED.md`.

## Agent skills

### Issue tracker

GitHub Issues via `gh` (this repo). See `docs/agents/issue-tracker.md`.

### Triage labels

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` — `docs/agents/triage-labels.md`.

### Domain docs

`CONTEXT.md` → `docs/CONTEXT.md` + `docs/adr/` — `docs/agents/domain.md`.

### Project skills (`.cursor/skills`)

- `orient` — PROGRESS + architecture-plan + narrow docs + Context7 for libs
- `implement-feature` — vertical slice; ports/adapters
- `implement-admin-feature` — Admin alias
- `verify-api-flow` — Gym Backend OTP → Bearer → endpoint (Postman MCP)
- `bootstrap-agent-os` — recreate Agent OS on another new project

### Matt Pocock (`.agents/skills`)

`/ask-matt`, `/grill-with-docs`, `/to-spec`, `/to-tickets`, `/implement`, `/tdd`, `/code-review`, …

## Showcase

https://prd-showcase.vercel.app/
