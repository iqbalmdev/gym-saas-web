# gym-saas-web

Next.js **Gym SaaS web** (PRD surface S2) — **Admin-first**, Trainer/Client web later in the same app.

This repository is the **Agent OS + product docs** home for building the web app with Cursor. Application UI scaffolding comes next, one vertical slice at a time.

## Quick links

| Doc | Purpose |
|---|---|
| [`docs/ai-development-playbook.md`](docs/ai-development-playbook.md) | **How we work** — steps, rules, skills, Context7, new-project bootstrap |
| [`docs/architecture-plan.md`](docs/architecture-plan.md) | Build contract (SOLID/DI, folders, module map) |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Current stage / Next up / Log |
| [`docs/api/client-auth.md`](docs/api/client-auth.md) | Backend auth contract (OTP, lanes, gym-orgs) |
| [`docs/mcp-setup.md`](docs/mcp-setup.md) | Connect Postman, Context7, Supabase, GitHub, Vercel, Playwright |
| [`postman/`](postman/) | Vendored [gym-backend-postman](https://github.com/abdulhasibn/gym-backend-postman) collection + envs |
| Showcase | https://prd-showcase.vercel.app/ |

## How to develop (short)

```text
orient → architecture-plan + PROGRESS
→ Context7 (library docs) / Postman MCP (API)
→ /grill-with-docs → /to-spec → /to-tickets
→ implement-feature + /tdd
→ verify-api-flow (OTP → Bearer → endpoint)
→ /code-review → update PROGRESS
```

## Agent OS layout

| Path | Purpose |
|---|---|
| `.cursor/rules/` | progress, architecture, SOLID/DI, DataGrants, Context7, Next.js, theme, … |
| `.cursor/skills/` | `orient`, `implement-feature`, `verify-api-flow`, `bootstrap-agent-os`, … |
| `.agents/skills/` | Matt Pocock engineering skills |
| `.cursor/mcp.json` | Context7, Postman, GitHub, Supabase, Vercel, Playwright |
| `docs/` | PRD, flows, CONTEXT, architecture, playbook, API auth |
| `postman/` | Import into Postman or drive via Postman MCP |

## Backend API

- **Prod:** `https://gym-backend-lovat-mu.vercel.app`
- **Auth:** Email OTP primary; lane `STAFF` for Admin web — see `docs/api/client-auth.md`
- **Postman upstream:** https://github.com/abdulhasibn/gym-backend-postman

## Status

Agent OS ready. Next.js app scaffold not started — see **Next up** in `docs/PROGRESS.md`.

## Related local repo

Earlier bootstrap also lived at `~/Projects/gym-admin-web`. **This repo (`gym-saas-web`) is the canonical continuation** with Postman vendored + auth guide.
