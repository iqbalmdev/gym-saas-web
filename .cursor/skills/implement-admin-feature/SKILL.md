---
name: implement-admin-feature
description: Use when building any Admin-facing feature that reads or writes gym-scoped data, member data, billing, invites, or DataGrants — anything where role, tenant, or consent boundaries matter. This is the permission-sensitive counterpart to implement-feature; use it instead whenever the feature touches another person's data.
---

# Implement admin feature

Everything in `implement-feature`, plus the authorization stack is
mandatory and comes first, not last.

## Steps

1. Do steps 1–3 of `implement-feature` (module, boundaries, data flow).
2. **Before writing the endpoint**, write out explicitly which of the four
   checks apply and why (security-data-access.mdc):
   - Auth: always.
   - Role: which roles are even allowed to call this (ADMIN only? TRAINER
     too?).
   - Tenant: does this require `gym_org_id` match on the resource?
   - Grant: does this touch CLIENT-owned data (progress/nutrition/
     wearables)? If yes, which scope's DataGrant is required?
3. Implement the API route/server action with all applicable checks in
   that exact order — auth, then role, then tenant, then grant.
4. Write the DB query with `gym_org_id` in the WHERE clause directly (or
   confirm RLS policy covers it) — not filtered after fetching.
5. Write the four minimum test cases from testing.mdc: happy path,
   missing role, wrong tenant, missing grant (if applicable).
6. Build the UI. For anything gated by a DataGrant, the UI must handle the
   "no grant" state gracefully (e.g. "Client hasn't shared progress data"),
   not a generic error.
7. **Before calling it done, re-read the diff and answer explicitly:**
   "Could this endpoint, as written, ever return data from a different
   gym_org_id, or a client's health data without an active grant?" If the
   answer isn't a confident no, fix it before finishing.
8. Offer to run `@progress-log`.
