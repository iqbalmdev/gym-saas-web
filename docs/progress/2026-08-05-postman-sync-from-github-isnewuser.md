# 2026-08-05 — Postman sync from GitHub (`isNewUser`)

- Pulled `abdulhasibn/gym-backend-postman` tip `d42602a8` → `/tmp/gym-postman-sync/` (ephemeral).
- Auth contract change: Request OTP returns `{ status, isNewUser }`; Verify includes `lane` only when `isNewUser: true` (`LANE_REQUIRED` if missing). Synced into `docs/api/client-auth.md`.
- Postman cloud inject **failed** (`401 Invalid API Key` on Postman MCP after `mcp_auth`). Manual: Import raw URLs in Postman Desktop, or re-login Postman MCP and re-run sync skill.
- Temp dir cleaned; no commit.
