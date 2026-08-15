# 2026-08-12 — Roster + attendance + renewals + my-data-grants (tip `91d4aba`)

- Postman sibling tip `91d4aba` (Roster, Attendance, Subscriptions renewals-due, Profile & Progress / my-data-grants under Membership Invites).
- Admin: `/admin/members` roster (list ACTIVE, offboard, check-in block); `/admin/attendance` desk-mark + day list; `/admin/renewals` renewals-due + payment patch.
- Client: `GET`/`PUT` `/gym-orgs/:id/my-data-grants` after accept; sticky DOB/HEIGHT/WEIGHT.
- Authz: roster/attendance/renewals = Auth + STAFF + gym tenant (API ADMIN); no DataGrant. Data grants = CLIENT + ACTIVE membership.
- Ports/adapters/actions/UI + E2E fixtures + Playwright specs. Docs `docs/api/roster.md`, `attendance.md`, `subscriptions.md`; membership-invites updated. No invent endpoints.
