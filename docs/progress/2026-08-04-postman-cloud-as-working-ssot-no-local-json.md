# 2026-08-04 — Postman cloud as working SSOT (no local JSON)

- Removed vendored `postman/` from this repo to avoid dual source of truth.
- Working SSOT: Postman cloud; publish SSOT: `abdulhasibn/gym-backend-postman`.
- Updated skill/rule/docs (`sync-postman-collection`, `postman-sync.md`, verify-api-flow, GETTING-STARTED, mcp-setup, README, client-auth).
- Verified prod API: `GET https://gym-backend-lovat-mu.vercel.app/health` → `200` `{"status":"ok"}`.
- Note: Postman MCP briefly returned 401 — re-login MCP if inject/env updates fail.
