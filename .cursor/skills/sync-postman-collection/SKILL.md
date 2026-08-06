---
name: sync-postman-collection
description: Sync Gym Backend API collection from abdulhasibn/gym-backend-postman (GitHub MCP) straight into Postman cloud (Postman MCP). No vendored postman/*.json in this repo. Use when syncing/updating the API collection or the user pastes the postman-sync prompt.
---

# Sync Postman collection (GitHub → Postman cloud only)

## Single source of truth

| Layer | Owns |
|---|---|
| **Publish (backend)** | GitHub [`abdulhasibn/gym-backend-postman`](https://github.com/abdulhasibn/gym-backend-postman) |
| **Working copy (this project)** | **Postman cloud** — collection + envs in the Active workspace (`docs/postman-sync.md`) |
| **Auth narrative (web repo)** | `docs/api/client-auth.md` (human/agent contract; not a duplicate of the full collection) |

**Do not** add or keep `postman/*.json` in `gym-saas-web`. Download only to an ephemeral temp dir (e.g. `/tmp/gym-postman-sync/`), inject, then delete.

## Canonical prompt

```
Use skill sync-postman-collection. Pull from abdulhasibn/gym-backend-postman with GitHub MCP and inject into my Postman workspace with Postman MCP (no local postman/ JSON). Update docs/api/client-auth.md if auth changed, note SHA in PROGRESS. Don’t commit unless I ask.
```

## Prerequisites

- **GitHub MCP** + **Postman MCP** ready
- Workspace ID from `docs/postman-sync.md` (or `getWorkspaces` / ask user)

## Base URLs (environments)

| Environment | `baseUrl` | Notes |
|---|---|---|
| **Gym Backend — dev** | `https://gym-backend-lovat-mu.vercel.app` | Prod API hosted on Vercel; verify `GET /health` → `{"status":"ok"}` |
| **Gym Backend — Local** | `http://localhost:3000` | Backend engineer local Express |
| Admin lane default | `STAFF` | Set on inject for Admin web smokes |

Upstream env JSON may still say `localhost` for “dev” — **override Dev `baseUrl` to the Vercel prod URL** when injecting for this project.

---

## Phase A — Fetch (ephemeral)

1. `list_commits` — `owner=abdulhasibn`, `repo=gym-backend-postman` — tip SHA.
2. `get_file_contents` on `/` — `download_url`s for collection + Dev/Local env JSON.
3. Download into **`/tmp/gym-postman-sync/`** (create if needed). Never write under the repo `postman/`.
4. Diff Auth request docs/Examples vs `docs/api/client-auth.md`; update guide only if the contract changed.
5. Note tip SHA + inject result in `docs/PROGRESS.md` and **Last verified sync** in `docs/postman-sync.md`.
6. **Do not commit** unless asked.

## Phase B — Inject (Postman MCP = working SSOT)

### B1. Workspace

Use Active workspace in `docs/postman-sync.md`. Else `getWorkspaces` / ask once and record the ID there.

### B2. Collection

1. `getCollections` — find `Gym Backend API`.
2. Read temp collection JSON; strip export `id` / `uid` / `info._postman_id` as required by Postman MCP.
3. Missing → `createCollection`; exists → `putCollection` (`Prefer: respond-async` if large). Keep existing cloud folder IDs when the MCP schema requires `item[].id`.
4. On failure: tell user to Import from the **GitHub raw URLs** (or Desktop from a one-off download). Do not invent a partial collection.
5. **Examples caveat:** MCP often drops nested `response` Examples. GitHub repo remains the publish SSOT for Examples; optional Desktop Import from GitHub raw / `createCollectionResponse`.

### B3. Environments

1. Map Dev/Local from temp JSON; blank secrets.
2. Force Dev `baseUrl` = `https://gym-backend-lovat-mu.vercel.app`, Local = `http://localhost:3000`, `lane` = `STAFF` for Admin.
3. `createEnvironment` / `putEnvironment` by name.

### B4. Cleanup + confirm

1. Delete `/tmp/gym-postman-sync/` (or its contents).
2. Report tip SHA, collection/env/workspace IDs, auth-doc updates, commit skipped.

## After sync

Run **verify-api-flow** against Postman cloud (STAFF OTP) when the user is ready.

## Out of scope

- Do not recreate a vendored `postman/` tree in this repo.
- Do not delete unrelated Postman collections/environments.
- Do not commit without an explicit user request.
