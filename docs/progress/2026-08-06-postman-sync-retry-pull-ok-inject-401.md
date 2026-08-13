# 2026-08-06 — Postman sync retry (pull OK, inject 401)

- Tip still `7ae3891099c99bad605282e18f0f85e2b26a43d5` (Staff Invites folder; Auth still has `isNewUser` + `LANE_REQUIRED`).
- GitHub MCP pull OK → `/tmp/gym-postman-sync/` (ephemeral; cleaned). Prep payloads ready (Dev `baseUrl` = Vercel prod, `lane=STAFF`).
- Postman MCP: `mcp_auth` reports success twice; `getCollections` / `getEnvironments` still **401 Invalid API Key**. Cloud inject skipped.
- `docs/api/client-auth.md` — publish SHA → `7ae38910` only (no OTP contract change). `docs/postman-sync.md` Last verified refreshed.
- No commit.
