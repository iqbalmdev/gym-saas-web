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

## Postman MCP (working SSOT)

1. Login to Postman MCP in Cursor.
2. Use the cloud collection **Gym Backend API** in the Active workspace (`docs/postman-sync.md`) — **do not** vendor JSON under `postman/` in this repo.
3. Auth contract: `docs/api/client-auth.md`
4. Agent skills: **sync-postman-collection** (GitHub → Postman cloud) · **verify-api-flow** (STAFF OTP smoke)
5. Prod API: `https://gym-backend-lovat-mu.vercel.app` — `GET /health` should return `{"status":"ok"}`. Local: `http://localhost:3000`.
6. If Postman MCP returns **401 Invalid API Key**, re-auth under Settings → Tools & MCP.

## Context7

Already wired in this repo via `${env:CONTEXT7_API_KEY}` in `.cursor/mcp.json`.

On this Mac the key is also stored in **local** `~/.cursor/mcp.json` (not in git).

1. **Quit Cursor fully** (Cmd+Q).
2. Reopen the project.
3. **Settings → Tools & MCP** → confirm **context7** is green / enabled.
4. Test in chat: `Using Context7, resolve library id for next.js and summarize App Router layouts.`

Optional dashboard key: https://context7.com/dashboard  
Never commit real keys to the repo.

## GitHub MCP + CLI

Project config uses `Authorization: Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}` (no secrets in git).

On this Mac, the token is stored locally in `~/.cursor/mcp.json` and `~/.zshrc`.

1. Quit and reopen Cursor.
2. **Settings → Tools & MCP** → confirm **github** is green.
3. Test: `Using GitHub MCP, list open issues on iqbalmdev/gym-saas-web.`

**Important:** Classic PATs need scopes such as `repo`, `read:org`, and ideally `workflow`. If MCP fails or `gh` shows **scopes: none**, regenerate the token at https://github.com/settings/tokens with those scopes, then update `~/.cursor/mcp.json` and `~/.zshrc`.

Never commit tokens. Rotate any token pasted into chat.

## Deeper reading

- `docs/GETTING-STARTED.md`
- `docs/ai-development-playbook.md`
