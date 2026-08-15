# 2026-08-06 — Settings-first Staff onboarding (plan A)

- Post-auth: STAFF + 0 gyms → `/admin/settings` (same for `isNewUser` true/false).
- Admin shell `settings-only` mode: Settings nav only; ops routes under `(ops)` redirect to Settings when empty.
- Settings composes create gym + invite inbox + staff invite admin panel.
- `/onboarding/create-gym` (+ onboarding layout) redirects to Settings.
- Create gym refreshes session → stay on Settings; accept invite → `/admin`.
- Unit: `admin-nav`, `resolvePostAuthPath`. E2E: login destinations, Settings-only shell, inbox accept.
- Docs: `architecture-plan` §7, `staff-invites.md`, research note superseded banner.
