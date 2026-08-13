# 2026-08-09 — Membership Invites Admin (M3)

- Postman sibling pull `acc01be` → `ca849e0` (Membership Invites + Subscriptions).
- Ports/adapter/actions for create, list, revoke; `/admin/members` replaces stub.
- Auth: STAFF session + gym affiliation; API enforces ADMIN. No DataGrant (gym-owned invites).
- Docs `docs/api/membership-invites.md`. Client inbox/accept deferred. No invent endpoints.
