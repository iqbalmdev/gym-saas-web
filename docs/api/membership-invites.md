# Membership invites (Admin — M3)

Contract from Postman **Membership Invites** @ `ca849e0` (sibling `gym-backend-postman`; not vendored in this repo).

**Auth:** Bearer **ADMIN** at the gym.

| Action | Method | Path |
|---|---|---|
| Create | `POST` | `/gym-orgs/:gymOrgId/membership-invites` |
| List | `GET` | `/gym-orgs/:gymOrgId/membership-invites?limit&offset` |
| Revoke | `POST` | `/gym-orgs/:gymOrgId/membership-invites/:membershipInviteId/revoke` |

**Create body:** `inviteeName`, `invitedEmail`, `basePlanId` (active BASE), `basePaymentStatus` (`paid` \| `unpaid` \| `partial`); optional `inviteePhone`; optional paired `addonPlanId` + `addonPaymentStatus`; optional `expiresAt` (default +14d).

**Cannot** invite a STAFF email (`INVALID_MEMBERSHIP_INVITEE`).

**Invite shape:** `id`, `gymOrgId`, `invitedEmail`, `invitedUserId`, `inviteeName`, `inviteePhone`, `basePlanId`, `basePaymentStatus`, `addonPlanId`, `addonPaymentStatus`, `status` (`PENDING` \| `ACCEPTED` \| `REVOKED` \| `EXPIRED`), `expiresAt`, timestamps, accept fields.

**Client (same email, lane CLIENT):**

| Action | Method | Path |
|---|---|---|
| Inbox | `GET` | `/membership-invites/inbox?limit&offset` |
| Accept | `POST` | `/membership-invites/:membershipInviteId/accept` |

**Accept body (optional):** `optionalProfileAttributes` (`GENDER`, `MEDICAL_NOTES`); `optionalClassGrants` (`PROGRESS`, `CALORIES`, `WEARABLES`, `DIET_PLANS`, `WORKOUT_PLANS`). Required `DOB` / `HEIGHT` / `WEIGHT` applied server-side.

**Still deferred:** `GET`/`PUT` `/gym-orgs/:id/my-data-grants`.

Web Admin: `/admin/members` — create, list, revoke.  
Web Client: `/client` — inbox + accept.
