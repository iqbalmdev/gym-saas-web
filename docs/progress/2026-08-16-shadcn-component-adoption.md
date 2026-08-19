# 2026-08-16 — shadcn/ui component adoption across Admin panels + auth

## What changed

Installed `table`, `select`, `badge`, `dialog`, `dropdown-menu`, `checkbox`,
`radio-group`, `textarea` into `components/ui/` via the shadcn CLI (all on top
of `@base-ui/react`, no new npm deps; every token they reference was already
CRM-aliased in `app/globals.css` per ADR-0006).

Migrated every raw HTML `<table>`, `<select>`, `<input>`, `<textarea>` outside
`components/ui/` to the shadcn equivalents:

- `modules/roster/components/roster-panel.tsx` — table + payment/check-in badges
- `modules/attendance/components/attendance-admin-panel.tsx` — search input, member select
- `modules/leads/components/leads-admin-panel.tsx` — capture + edit-row fields, notes textarea, status select
- `modules/membership-invites/components/members-admin-panel.tsx` — invite fields, plan/payment selects, invite-status badge
- `modules/plans/components/plans-admin-panel.tsx` — plan fields, kind select
- `modules/staff-invites/components/staff-invites-admin-panel.tsx` — staff code input, role select
- `modules/auth/components/login-form.tsx` — email/otp/name inputs, Staff/Member `RadioGroup`
- `modules/auth/components/google-oauth-callback-client.tsx` — same lane-chooser pattern
- `modules/gym-orgs/components/create-gym-form.tsx` — name/email/timezone inputs
- `modules/membership-invites/components/data-grants-panel.tsx` — profile/grant `Checkbox`
- `modules/membership-invites/components/membership-invite-inbox.tsx` — profile/grant `Checkbox`

`dialog` and `dropdown-menu` were installed but have no consuming screen yet.

Caught by `tsc`, not by eye: Base UI's `Select.onValueChange` and
`RadioGroup.onValueChange` pass `string | null`, not a bare string — three
spots that passed a `useState` setter directly needed a `value ?? ''` guard
(`attendance-admin-panel.tsx`, `members-admin-panel.tsx` ×2).

Verified: `typecheck`, `lint --max-warnings=0`, `prettier`, `vitest` (58/58),
`next build` — all clean.

## Follow-up: Playwright POMs for Base UI `Select` (fixed same day)

`e2e/attendance.spec.ts` and `e2e/staff-invites.spec.ts` drove the member/role
pickers via `.locator('option')` + `.selectOption()`, which only works against
a native `<select>`. The `select.tsx` migration replaced the native element
with Base UI's custom listbox (`role="combobox"` trigger, portalled
`role="listbox"` popup, `role="option"` items), so both specs were broken.

Fixed by opening the trigger and clicking the matching `role="option"`
instead:

- `e2e/pages/attendance.page.ts` — added `memberOption(name)` and
  `selectMember(name)` helpers.
- `e2e/pages/settings.page.ts` — added `roleSelect` locator (role-based,
  replacing the ad-hoc `page.getByLabel('Role')` in the spec) and a
  `selectRole(name)` helper.
- `e2e/attendance.spec.ts` / `e2e/staff-invites.spec.ts` — updated to use the
  new helpers.

Verified: full `npx playwright test` suite — 26/26 passed, including both
previously-broken specs.
