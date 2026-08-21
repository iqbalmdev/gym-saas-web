# Roster (Admin — gym-owned)

Contract from Postman **Roster** + **Gym Orgs → List Gym Trainers** @ sibling `gym-backend-postman` tip `9b0b561`.

**Authz:** Bearer **ADMIN** at the gym. Web: Auth + STAFF session + gym tenant. **No DataGrant** (membership / check-in block / trainer assignment are gym-owned).

| Action | Method | Path |
|---|---|---|
| List members | `GET` | `/gym-orgs/:gymOrgId/members?status&q` |
| Offboard | `POST` | `/gym-orgs/:gymOrgId/members/:membershipId/offboard` |
| Check-in block | `PATCH` | `/gym-orgs/:gymOrgId/members/:membershipId/check-in-block` |
| List gym trainers | `GET` | `/gym-orgs/:gymOrgId/trainers?limit&offset` |
| Assign trainer | `POST` | `/gym-orgs/:gymOrgId/members/:membershipId/assign-trainer` |

**List query:** `status` (`ACTIVE` \| `INACTIVE`, default `ACTIVE`); `q` search name/email/phone.

**List `200`:** `{ members: Member[] }` — `membershipId`, `clientUserId`, `gymOrgId`, `status`, `checkInBlocked`, `assignedTrainerId`, `clientName`, `clientEmail`, `clientPhone`, `joinedAt`, `leftAt`, `basePaymentStatus`, `baseAmountPaid`, `basePriceAmount`.

**Check-in block body:** `{ blocked: boolean }`.

**Mutation `200`:** `{ membership }` — ids, `status`, `checkInBlocked`, `assignedTrainerId`, `joinedAt`, `leftAt`, `updatedAt`.

**List gym trainers `200`:** `{ trainers: { items, total, limit, offset } }` — each item has `trainerProfileId` (pass to assign — this is `trainer_profiles.id`, not a staff-invite user id), `userId`, `name`, `email`, `staffCode`, `isAdmin`. Live `trainer_profiles`, not staff invites.

**Assign trainer body:** `{ trainerProfileId }` — requires in-date `TRAINER_COACHING` addon (payment ignored). Web maps `COACHING_ADDON_REQUIRED` to calm copy; unpaid never hides the picker.

**Web Admin:** `/admin/members` lists ACTIVE members, offboards, toggles check-in block, and assigns a trainer from `GET /gym-orgs/:id/trainers` (gym-orgs port + BFF `/api/gym-orgs/trainers`). Tenant id is taken from the session, never the client.
