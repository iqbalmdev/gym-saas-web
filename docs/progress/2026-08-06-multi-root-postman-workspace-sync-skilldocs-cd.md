# 2026-08-06 — Multi-root Postman workspace + sync skill/docs (C/D)

- Cloned sibling `/Users/iqbal/Projects/gym-backend-postman` @ `7ae38910`.
- Added `gym-saas.code-workspace` (web + postman roots).
- Rewrote **sync-postman-collection**: prefer sibling `git pull` → Postman MCP inject; GitHub MCP fallback.
- Updated `docs/postman-sync.md`, `mcp-setup.md`, `GETTING-STARTED.md`, rule `postman-sync.mdc`, `architecture.mdc`, `AGENTS.md`, **orient**, **verify-api-flow**, **implement-feature**, `README.md`.
- Still no vendored `postman/*.json` in web repo.
