# Staff invites (Admin web)

Contract from Postman **Staff Invites** @ `7a2d9bf` ([gym-backend-postman](https://github.com/abdulhasibn/gym-backend-postman)).

**Auth:** `Authorization: Bearer <accessToken>` (STAFF lane). Create/list/revoke = gym **Admin**. Inbox/accept = invitee STAFF.

| Action | Method | Path |
|---|---|---|
| Create | `POST` | `/gym-orgs/:gymOrgId/staff-invites` |
| List (gym) | `GET` | `/gym-orgs/:gymOrgId/staff-invites?limit&offset` |
| Inbox | `GET` | `/gym-orgs/staff-invites/inbox?limit&offset` |
| Revoke | `POST` | `/gym-orgs/staff-invites/:inviteId/revoke` |
| Accept | `POST` | `/gym-orgs/staff-invites/:inviteId/accept` |

**Create body:** `{ staffCode, targetRole: "TRAINER"|"ADMIN", expiresAt? }`  
**Invite shape:** `id`, `gymOrgId`, `invitedUserId`, `targetRole`, `status`, `expiresAt`, `createdBy`, `acceptedAt`, `createdAt`, `updatedAt`  
**Inbox items** also embed `gym`: `{ id, name, address, contactPhone, contactEmail, logoUrl, timezone }` (soft-deleted gyms omitted).  
**Page envelope:** `{ staffInvites: { items, total, limit, offset } }`

Statuses: `PENDING` | `ACCEPTED` | `REVOKED` | `EXPIRED` (list may show effective EXPIRED).

Web surfaces: **Settings** only — create GymOrg, invite inbox/accept, create/list/revoke staff invites. Invite by **staff_code**, not email. First-run Staff (no gym) see Settings-only Admin chrome. Invitee inbox = **Accept** only; **Revoke** is Admin (gym panel).
