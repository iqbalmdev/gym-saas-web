---
name: sync-postman-collection
description: Pull sibling gym-backend-postman and inject into Postman cloud via Postman MCP. No vendored postman/*.json in web.
---

# Sync Postman collection

## SSOT

| Layer | Owns |
|---|---|
| Publish | Sibling `../gym-backend-postman` |
| Working | Postman cloud (`docs/postman-sync.md`) |
| Web narrative | `docs/api/client-auth.md`, `docs/api/staff-invites.md` |

Open `gym-saas.code-workspace`. **Never** vendor `postman/*.json` here.

## Prompt

```
Use skill sync-postman-collection. Pull sibling gym-backend-postman, inject into Postman cloud. Update auth docs if contract changed. Don’t commit unless I ask.
```

## A — Fetch

1. Prefer sibling: `git pull --ff-only` in `../gym-backend-postman`. Record tip SHA.
2. Read collection + Dev/Local env JSON from sibling (or ephemeral `/tmp/gym-postman-sync/` only).
3. Fallback: GitHub MCP on `abdulhasibn/gym-backend-postman`.
4. Diff Auth/Staff Invites vs web guides; update guides only if contract changed.

## B — Inject (Postman MCP)

1. Workspace IDs in `docs/postman-sync.md`.
2. `putCollection` / `createCollection` for **Gym Backend API**.
3. Envs: Dev `baseUrl` = Vercel prod; Local = `http://localhost:3000`; `lane=STAFF`.
4. Delete temp prep. Note SHA + result in `docs/postman-sync.md` / PROGRESS. No commit unless asked.

## Out of scope

No inventing endpoints · no committing sibling into this repo · no deleting unrelated Postman items.
