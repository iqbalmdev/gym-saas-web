# Gym SaaS Web — Domain Language

Shared vocabulary for humans and agents. Prefer these terms in code, commits, PRs, and UI copy.

**Surface:** Next.js web (S2) — **Admin-first**, with **Trainer** and **Client** web planned in the same app. Mobile (S1) and Express + Supabase (S3) are separate surfaces that share this domain.

## Language

**GymOrg**  
The gym tenant. Scoped by `gym_org_id`. MVP Admin UI is single-gym (no branch switcher) even if an owner can own multiple orgs in data.  
_Avoid:_ gym account, workspace, tenant (except when explaining tenancy), studio

**Account lane**  
Signup choice: `CLIENT` or `STAFF`. One person cannot be Client and Staff on the same account.  
_Avoid:_ user type, account type (prefer lane + role)

**Role**  
Frozen system role codes: `CLIENT`, `STAFF_UNASSIGNED`, `TRAINER`, `ADMIN`. Gyms cannot edit roles/permissions.  
_Avoid:_ custom RBAC, permission set (use permission code)

**Admin**  
Staff with `ADMIN` role in a GymOrg (owner or invited desk Admin). Primary user of this Next.js app.  
_Avoid:_ gym manager (ok in marketing copy only)

**Admin-as-Trainer**  
Same Admin account that also has a `trainer_profiles` row and can coach.  
_Avoid:_ dual role on one Client+Staff account

**Membership invite**  
Admin-issued only path for a Client to join. No open join codes. Creates ACTIVE membership only on accept.  
_Avoid:_ join link as open code, shadow profile, walk-in profile without accept

**Client membership**  
Affiliation of a Client User to a GymOrg. At most one `ACTIVE` membership per person at a time. Statuses include `ACTIVE` / `INACTIVE`.  
_Avoid:_ subscription (that is a billing line), enrollment

**DataGrant**  
Explicit Client consent for staff to *read* Client-owned data. Profile attributes (e.g. DOB, HEIGHT, WEIGHT) and class grants (`PROGRESS`, `CALORIES`, `WEARABLES`, `DIET_PLANS`, `WORKOUT_PLANS`). Never copies data into gym tables.  
_Avoid:_ permission (roles), share setting, privacy toggle (prefer DataGrant)

**Gym-owned data**  
Owned by the gym: membership, invites, subscriptions, attendance, leads, plan catalog. Staff access via affiliation + role — no DataGrant.  
_Avoid:_ shared data

**Client-owned data**  
Owned by the User: profile, progress, calories, wearables/metrics, assigned diet/workout plans + completions. Staff need DataGrant (except plan *authoring* rules in PRD).  
_Avoid:_ personal data (too vague)

**Plan (catalog)**  
Admin-named catalog entry with `kind` `BASE` | `ADDON`. ADDON also has `capability` (MVP: `TRAINER_COACHING`).  
_Avoid:_ package, product (ok in CRM lead interest only)

**Subscription line**  
A member’s base or addon line with price/duration snapshot and `payment_status` (`paid` / `unpaid` / `partial`). Entitlement follows **dates**, not payment status.  
_Avoid:_ invoice, payment (payment status is tracked; no payment gateway in MVP)

**T-2 renewal**  
Reminder when a subscription line ends in 2 days (gym timezone). Admin inbox + client push/in-app.  
_Avoid:_ expiry alert (prefer renewal)

**Block check-in**  
Manual Admin safety valve. Not auto-tied to unpaid status.  
_Avoid:_ suspend membership (offboard is separate)

**Offboard**  
Membership → `INACTIVE`; all DataGrants for that gym clear; attendance + billing history retained.  
_Avoid:_ delete member, erase (erasure is DPDP P1, separate)

**Lead**  
Mini-CRM prospect. Pipeline: New → Contacted → Trial → Converted → Lost. Soft warn on duplicate open-lead phone.  
_Avoid:_ contact (too generic), opportunity (CRM jargon from other products)

**Desk attendance**  
Admin marks a client present at the desk. Distinct from Client self check-in. Trainer cannot log attendance in MVP.

**Issue tracker**  
Where work items live for agent skills (GitHub Issues by default after setup).  
_Avoid:_ backlog manager

## Relationships

- A **GymOrg** has many Admins, Trainers, membership invites, Clients (via memberships), leads, and catalog plans.
- A **Client** accepts a **Membership invite** → one **Client membership** → one or more **Subscription lines** (required BASE + optional ADDON).
- **DataGrants** are per gym affiliation; they clear on offboard and never auto-carry to another gym.
- Runtime authz for Client-owned reads = affiliation ∧ permission code ∧ **DataGrant**.

## Flagged ambiguities

- “Subscription” vs “membership” — membership is affiliation; subscription lines are billing/entitlement rows.
- “Permission” vs “DataGrant” — permission is role capability; DataGrant is client consent to read Client-owned data.
- “Theme” in this repo means UI visual tokens (swappable). Not product “theme” of workouts.
