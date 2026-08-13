# Roster (Admin — gym-owned)

Contract from Postman **Roster** @ `91d4aba` (sibling `gym-backend-postman`).

**Authz:** Bearer **ADMIN** at the gym. Web: Auth + STAFF session + gym tenant. **No DataGrant** (membership / check-in block are gym-owned).

| Action | Method | Path |
|---|---|---|
| List members | `GET` | `/gym-orgs/:gymOrgId/members?status&q` |
| Offboard | `POST` | `/gym-orgs/:gymOrgId/members/:membershipId/offboard` |
| Check-in block | `PATCH` | `/gym-orgs/:gymOrgId/members/:membershipId/check-in-block` |

**List query:** `status` (`ACTIVE` \| `INACTIVE`, default `ACTIVE`); `q` search name/email/phone.

**List `200`:** `{ members: Member[] }` — `membershipId`, `clientUserId`, `gymOrgId`, `status`, `checkInBlocked`, `assignedTrainerId`, `clientName`, `clientEmail`, `clientPhone`, `joinedAt`, `leftAt`, `basePaymentStatus`, `baseAmountPaid`, `basePriceAmount`.

**Check-in block body:** `{ blocked: boolean }`.

**Mutation `200`:** `{ membership }` — ids, `status`, `checkInBlocked`, `assignedTrainerId`, `joinedAt`, `leftAt`, `updatedAt`.

**Skipped in Web MVP:** Assign Trainer UI (no trainer list endpoint wired).

Web Admin: `/admin/members` — roster panel under membership invites.
