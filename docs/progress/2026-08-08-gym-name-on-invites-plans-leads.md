# 2026-08-08 — Gym name on invites + Plans + Leads

- Inbox: parse/display embedded `gym.name` (was stripped by Zod). Admin staff invites + shell show active gym name.
- **Plans** (`/admin/plans`): ports/adapter, create BASE/ADDON, list filter, activate, soft delete. Docs `docs/api/plans.md`.
- **Leads** (`/admin/crm`): ports/adapter, create (example walk-in), status pipeline, due follow-ups, delete. Docs `docs/api/leads.md`.
- Composition + E2E fixtures wired. No invent endpoints (Postman tip `7a2d9bf`).
