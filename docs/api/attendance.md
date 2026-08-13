# Attendance (Admin desk)

Contract from Postman **Attendance** @ `91d4aba` (sibling `gym-backend-postman`).

**Authz:** Bearer **ADMIN** at the gym for desk-mark / gym day list. Web: Auth + STAFF session + gym tenant. **No DataGrant** (attendance is gym-owned).

| Action | Method | Path |
|---|---|---|
| Desk mark | `POST` | `/gym-orgs/:gymOrgId/attendances/desk-mark` |
| List gym day | `GET` | `/gym-orgs/:gymOrgId/attendances?day&limit&offset` |

**Desk mark body:** `{ clientUserId }` → `201` `{ attendance }`.

**Attendance fields:** `id`, `clientUserId`, `gymOrgId`, `occurredAt`, `recordedBy` (`CLIENT` \| `ADMIN`), `recorderUserId`, `createdAt`, `baseStarted`.

**List `200`:** `{ attendances: { items, total, limit, offset } }`.

Web Admin: `/admin/attendance` — desk mark from active roster + today's list.
