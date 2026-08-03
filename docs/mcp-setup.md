# MCP & CLI setup

After editing `.cursor/mcp.json`, open **Cursor Settings → Tools & MCP**, enable each server, and complete **Needs login** / OAuth.

## Configured servers

| Server | Purpose for this project |
|---|---|
| **postman** | Run/sync [Gym Backend API](https://github.com/abdulhasibn/gym-backend-postman) — OTP, `/auth/me`, gym-orgs, future Admin routes |
| **context7** | Up-to-date Next.js / Zod / Playwright docs while coding |
| **github** | Issues / PRs for this repo |
| **supabase** | Dev DB/docs only — not production |
| **vercel** | Deployments / logs |
| **playwright** | Browser smoke after UI exists |

## Postman MCP + vendored collection

1. Login to Postman MCP in Cursor.
2. Prefer workspace collection aligned with files in `postman/`:
   - `Gym-Backend-API.postman_collection.json`
   - `Gym-Backend-Dev.postman_environment.json` (`baseUrl`, `email`, `lane`, `otpToken`, `accessToken`, …)
   - `Gym-Backend-Local.postman_environment.json`
3. Auth contract: `docs/api/client-auth.md`
4. Agent skill: **verify-api-flow** (STAFF lane for Admin web)

Prod API: `https://gym-backend-lovat-mu.vercel.app`

## Context7

Optional API key: https://context7.com/dashboard — see rule `context7-docs.mdc`.

## Verify prompts

- “Using Postman MCP, list collections; ensure Gym Backend API is available.”
- “Using verify-api-flow: request OTP for my STAFF email against Dev env.”
- “Using Context7, fetch Next.js App Router docs for layouts.”

## Deeper reading

- `docs/GETTING-STARTED.md`
- `docs/ai-development-playbook.md`
