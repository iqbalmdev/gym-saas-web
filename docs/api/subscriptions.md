# Subscriptions / renewals (Admin)

Contract from Postman **Subscriptions** @ `91d4aba` (sibling `gym-backend-postman`).

**Authz:** Bearer **ADMIN** at the gym. Web: Auth + STAFF session + gym tenant. **No DataGrant** (billing snapshots are gym-owned).

| Action | Method | Path |
|---|---|---|
| Renewals due | `GET` | `/gym-orgs/:gymOrgId/subscriptions/renewals-due?onOrBefore&onOrAfter&limit&offset` |
| Update payment | `PATCH` | `/gym-orgs/:gymOrgId/subscriptions/:subscriptionId/payment` |

**Renewals `200`:** `{ renewals: { items, total, limit, offset } }`.  
Item fields: `id`, `clientMembershipId`, `gymOrgId`, `planId`, `kind` (`BASE` \| `ADDON`), `capability`, `priceAmount`, `durationDays`, `startDate`, `endDate`, `startSource`, `paymentStatus`, `amountPaid`, timestamps, plus `clientUserId`.

**Payment body:** `{ paymentStatus: paid|unpaid|partial, amountPaid? }` — `partial` requires `amountPaid`.

Web Admin: `/admin/renewals` — default window today → +2 days; optional payment status update on a row.
