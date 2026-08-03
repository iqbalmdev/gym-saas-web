# Progress

Living project stage for agents and humans. Newest log entries first. Do not delete old log entries.

## Current stage

| Area | Status |
|---|---|
| Agent OS (rules, skills, docs, playbook) | Done |
| Architecture plan + SOLID/DI | Done (ADR-0003, ADR-0004) |
| Matt Pocock skills | Done (`.agents/skills`) |
| Postman collection vendored | Done — `postman/` from abdulhasibn/gym-backend-postman |
| Client/Admin auth guide | Done — `docs/api/client-auth.md` |
| MCP (Context7, Postman, GitHub, Supabase, Vercel, Playwright) | Config in `.cursor/mcp.json` — **user must OAuth** |
| Next.js app scaffold | Not started |
| Feature modules | Not started (Admin order: architecture-plan §6) |
| GitHub remote | Done — https://github.com/iqbalmdev/gym-saas-web |

**Summary:** New canonical repo `gym-saas-web` with full Agent OS from the AI playbook, plus Gym Backend Postman collection and auth integration guide for Postman MCP testing.

## Next up

1. User: Cursor Settings → Tools & MCP → login **Postman** + **Context7** (+ others).
2. Import or sync `postman/Gym-Backend-API.postman_collection.json`; run `verify-api-flow` (STAFF OTP → `/auth/me` → `/gym-orgs`).
3. Scaffold Next.js per `docs/architecture-plan.md` §5 (`lib/ports`, adapters, `(auth)` + `(admin)`).
4. Admin Phase A: M1 auth → M2 GymOrg → M4 plans → renewals inbox → M3 → M5 → M11 CRM.

## Log

### 2026-08-03 — gym-saas-web canonical Agent OS + Postman

- Created `~/Projects/gym-saas-web` as the continuation repo.
- Carried forward rules, skills, architecture plan, playbook, Matt Pocock skills from prior bootstrap.
- Vendored Postman collection/envs from https://github.com/abdulhasibn/gym-backend-postman
- Added `docs/api/client-auth.md`; refreshed `verify-api-flow` for Gym Backend + Postman MCP.
- Showcase alignment: https://prd-showcase.vercel.app/

### Prior work (gym-admin-web)

- Agent OS bootstrap, multi-persona ADR, Matt skills, Context7, SOLID/DI architecture plan.
