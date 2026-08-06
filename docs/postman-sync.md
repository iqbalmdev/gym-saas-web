# Sync Postman collection (no local JSON)

## Single source of truth

| Layer | What |
|---|---|
| **Publish** | [abdulhasibn/gym-backend-postman](https://github.com/abdulhasibn/gym-backend-postman) — backend engineer updates collection/envs here |
| **Working copy** | **Postman cloud** (this project’s Active workspace below) — agents run/sync via Postman MCP |
| **Auth narrative** | `docs/api/client-auth.md` in this repo — not a full collection duplicate |

**This repo does not vendor `postman/*.json`.** Keeping both cloud and git copies in `gym-saas-web` caused dual SSOT drift.

Skills: **sync-postman-collection** · **verify-api-flow**  
Rule: `.cursor/rules/postman-sync.mdc`

## Pipeline

```
Backend updates GitHub (gym-backend-postman)
        ↓
GitHub MCP → download to /tmp/gym-postman-sync/ only
        ↓
Postman MCP → createCollection / putCollection (+ envs)
        ↓
Delete temp files
        ↓
verify-api-flow against Postman cloud when needed
```

## Backend API URLs

| Name | `baseUrl` | Check |
|---|---|---|
| **Prod (Dev env in Postman)** | `https://gym-backend-lovat-mu.vercel.app` | `GET /health` → `200` `{"status":"ok"}` (verified 2026-08-04) |
| **Local** | `http://localhost:3000` | Local Express when running |

Root `GET /` may return `404 NOT_FOUND` — that is expected; use `/health` or collection routes.

Admin smokes: Postman env **Gym Backend — dev** with `lane=STAFF` and prod `baseUrl`.

---

## Active Postman workspace

| Field | Value |
|---|---|
| Workspace ID | `e9147605-c2a5-48a6-8497-46b4a3489b95` (My Workspace) |
| Collection name | `Gym Backend API` |
| Collection uid | `33631273-e6dafd3b-8829-4ba6-885f-763020fc8347` |
| Env Dev uid | `33631273-1aa7f187-7064-4d7e-a761-fedcbdc3b2bd` |
| Env Local uid | `33631273-70c6c3c1-3487-45db-b394-30ed5cf90718` |

---

## Canonical prompt

```
Use skill sync-postman-collection. Pull from abdulhasibn/gym-backend-postman with GitHub MCP and inject into my Postman workspace with Postman MCP (no local postman/ JSON). Update docs/api/client-auth.md if auth changed, note SHA in PROGRESS. Don’t commit unless I ask.
```

---

## Agent steps (summary)

1. `list_commits` + `get_file_contents` on upstream repo.
2. Download JSON to `/tmp/gym-postman-sync/` (never into the git tree).
3. Inject collection/envs via Postman MCP; force Dev `baseUrl` = prod Vercel URL, `lane` = `STAFF`.
4. Update `docs/api/client-auth.md` only if auth contract changed.
5. Note SHA in `docs/PROGRESS.md`; refresh **Last verified sync** below.
6. Delete `/tmp/gym-postman-sync/`.
7. Do not commit unless asked.

| MCP | Tools |
|---|---|
| GitHub | `list_commits`, `get_file_contents` |
| Postman | `getWorkspaces`, `getCollections`, `createCollection`, `putCollection`, `createEnvironment`, `putEnvironment` |

### Examples caveat

Postman MCP often cannot round-trip nested request **Examples**. Publish SSOT for Examples remains the GitHub repo; optional Desktop Import from GitHub raw URLs if cloud Examples are required.

### Manual fallback (MCP inject fails)

Import in Postman Desktop from GitHub raw (or a one-off download you discard):

- `https://raw.githubusercontent.com/abdulhasibn/gym-backend-postman/main/Gym-Backend-API.postman_collection.json`
- same for `Gym-Backend-Dev` / `Gym-Backend-Local` environment files  

Then set Dev `baseUrl` to prod and `lane` to `STAFF`.

---

## Last verified sync

| Field | Value |
|---|---|
| Upstream tip | `d42602a8ee5c167770b180c984574251ec113ed9` (2026-08-05 — `isNewUser` + optional lane) |
| Postman inject | **Blocked** — Postman MCP `401 Invalid API Key` after re-auth; re-login Postman in Cursor Settings, then re-run sync **or** Desktop Import from raw URLs below |
| Local `postman/` | **Removed** — Postman cloud is working SSOT |
| Auth guide | Updated `docs/api/client-auth.md` from tip SHA |
| Prod API check | `GET https://gym-backend-lovat-mu.vercel.app/health` → `200` ok (2026-08-04) |
