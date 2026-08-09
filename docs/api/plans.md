# Plans (Admin catalog)

Contract from Postman **Plans** @ `7a2d9bf`.

**Auth:** Bearer **ADMIN** at the gym.

| Action | Method | Path |
|---|---|---|
| Create | `POST` | `/gym-orgs/:gymOrgId/plans` |
| List | `GET` | `/gym-orgs/:gymOrgId/plans?kind&active&limit&offset` |
| Get | `GET` | `/gym-orgs/:gymOrgId/plans/:planId` |
| Update | `PATCH` | `/gym-orgs/:gymOrgId/plans/:planId` |
| Soft delete | `DELETE` | `/gym-orgs/:gymOrgId/plans/:planId` → `204` |

**Create BASE:** `{ name, kind: "BASE", durationDays, price }` — `capability` null.  
**Create ADDON:** `{ name, kind: "ADDON", capability: "TRAINER_COACHING", durationDays, price }`.  
**Update:** `name`, `durationDays`, `price`, `active` only (`kind` / `capability` immutable).

**Plan shape:** `id`, `name`, `kind`, `capability`, `durationDays`, `price`, `active` (+ timestamps / gymOrgId when returned).

Web: `/admin/plans` — list with kind filter, create Base/Add-on, activate/deactivate, soft delete.
