# 2026-08-16 — Status-badge scale wired up

Closes the three implementation gaps `docs/ui-design-system.md` §3 called out: no
`success`/`warning` badge variant, statuses rendering as a badge on some screens and bare
text on others, and `roster-panel` painting every payment state `outline`.

## What changed

- `components/ui/badge.tsx` — added `success` and `warning` variants, styled from
  `--color-success` / `--color-warning` the same way the existing `destructive` variant is
  styled from `--color-danger`.
- `lib/ui/status-tone.ts` (new) — `StatusTone` (`neutral` | `positive` | `warning` |
  `danger`) and `statusToneBadgeVariant()` mapping a tone to the `<Badge variant>` that
  renders it. Also `inviteStatusTone()`, the one mapping membership and staff invites
  share (identical enum shape, so a single function keeps them from diverging).
- `membership-invites-labels.ts` — `membershipPaymentStatusTone` (unpaid/partial →
  `warning`, never `danger` — entitlement follows subscription dates, not
  `payment_status`) and `membershipInviteStatusTone` (aliases `inviteStatusTone`).
- `staff-invites-labels.ts` — `staffInviteStatusTone` (same alias).
- `roster-panel.tsx` — payment badge now maps through `membershipPaymentStatusTone`
  instead of a hardcoded `outline`; check-in badge maps `Blocked`/`Allowed` through
  `statusToneBadgeVariant('danger' | 'neutral')` (was `destructive`/`secondary` — the
  scale's neutral tone is an outline badge, not `secondary`).
- `members-admin-panel.tsx` — the base-payment status, previously folded into a plain-text
  line with plan name and expiry, is now its own `<Badge>` next to the invite-status badge.
- `membership-invite-inbox.tsx` and `staff-invites-admin-panel.tsx` — invite status (and,
  for the client inbox, base payment) converted from bare text to `<Badge>`.

## Left alone

Lead pipeline stages are edited through a `<Select>`, not displayed as a status badge
anywhere in the current UI, so the neutral/positive pipeline mapping in
`ui-design-system.md` has no call site yet — nothing to fix, nothing invented. Membership
`ACTIVE`/`INACTIVE` is filtered before render (`roster-panel` only ever lists `ACTIVE`
members), same story.

## Verified

`npm run verify` (lockfile check, Prettier `format:check`, ESLint `--max-warnings=0`,
typecheck, 64 unit tests) — clean.
