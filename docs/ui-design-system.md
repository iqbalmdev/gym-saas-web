# UI design system — rules

Prescriptive. If a screen disagrees with this doc, the screen is wrong.
Direction and light/dark mechanics live in `ui-theme.md`; token definitions live in
`lib/theme/crm-tokens.css`. This doc says **which token for which job**.

## 1. Tokens

Two layers, one source. `lib/theme/crm-tokens.css` defines the CRM tokens; the alias
block in `app/globals.css` points shadcn's names at them (ADR-0006). **Retheme by editing
`crm-tokens.css` only** — never a literal colour in a feature, never a new `--color-*`
in `globals.css`.

| Job | Token | Notes |
|---|---|---|
| Page background | `--color-canvas` | the shell, never a panel |
| Recessed area | `--color-canvas-accent` | nav rail, inset regions |
| Panel / card / row | `--color-surface` | everything readable sits here |
| Hairlines, dividers | `--color-border` | `/80` or `/70` for softer table rules |
| Body text | `--color-fg` | |
| Secondary text | `--color-fg-muted` | labels, metadata, timestamps |
| Primary action, active nav | `--color-accent` + `--color-accent-fg` | near-black by design, not indigo |
| Status | `--color-info` `--color-warning` `--color-danger` `--color-success` | §3 governs when |
| Panel radius | `--radius-panel` | panels and tables |
| Control radius | `--radius-control` | inputs, buttons |
| Pill radius | `--radius-pill` | badges only |

Use Tailwind 4 shorthand — `text-(--color-fg)`, not `text-[var(--color-fg)]`.

## 2. Density

Admin is an operations tool: tables and inboxes, not marketing.

- **Table cells** `px-4 py-3`. **Header row** `text-xs uppercase tracking-wide` in
  `--color-fg-muted`. Reference: `modules/roster/components/roster-panel.tsx`.
- **Panels** `p-5`, or `p-4 md:p-6` where a panel holds a form.
- **Panel stack** `space-y-6`; **section stack inside a panel** `space-y-3`.
- Prefer a table or a plain list over cards-for-everything.

## 3. Status badges — one semantic scale

### The rule that overrides visual instinct

**`unpaid` is `warning`, never `danger`.** Entitlement follows subscription dates, not
`payment_status` (`000-project-context.mdc`) — an unpaid member still trains. Rendering
unpaid in red tells the Admin the member is blocked, which is false. **`danger` is
reserved for states that actually deny access**, and today exactly one does:
`checkInBlocked`.

### The scale

Four tones. Every domain status maps onto one of them, so a colour means the same thing
on every screen.

| Tone | Means | Use |
|---|---|---|
| `neutral` | inert, expected, no action | outline badge |
| `positive` | terminal good | `--color-success` |
| `warning` | needs attention, still functioning | `--color-warning` |
| `danger` | access denied / destructive | `--color-danger` |

### Mapping

| Domain | State | Tone |
|---|---|---|
| Payment (`paid`/`partial`/`unpaid`) | `paid` | positive |
| | `partial` | warning |
| | `unpaid` | warning — *not* danger, see above |
| Membership (`ACTIVE`/`INACTIVE`) | `ACTIVE` | positive |
| | `INACTIVE` | neutral |
| Invite — membership **and** staff | `PENDING` | neutral |
| | `ACCEPTED` | positive |
| | `EXPIRED` | warning |
| | `REVOKED` | neutral — a deliberate Admin action, not a failure |
| Check-in | `Blocked` | **danger** (the only one) |
| | `Allowed` | neutral |

Membership invites and staff invites share one enum shape and therefore one mapping.
Don't diverge them.

### Lead pipeline is not a status

`NEW → CONTACTED → TRIAL → CONVERTED → LOST` is **progress**, not health. Forcing it onto
the health scale would imply `TRIAL` is a warning, which is nonsense. Pipeline stages
render **neutral**, with two exceptions: `CONVERTED` = positive, `LOST` = neutral at
reduced emphasis (`--color-fg-muted`). Never colour the middle stages.

### Implementation

The scale is wired up via `lib/ui/status-tone.ts` — `StatusTone` (`neutral` | `positive` |
`warning` | `danger`) plus `statusToneBadgeVariant()`, which maps a tone to the `<Badge
variant>` that renders it (`outline` / `success` / `warning` / `destructive`). Each
domain's tone mapping lives next to its labels: `membershipPaymentStatusTone` and
`membershipInviteStatusTone` in `membership-invites-labels.ts`, `staffInviteStatusTone` in
`staff-invites-labels.ts` (aliased to the same `inviteStatusTone()` so membership and
staff invites can't diverge). Every domain status is now a `<Badge>` — never bare text —
across `roster-panel`, `members-admin-panel`, `membership-invite-inbox`, and
`staff-invites-admin-panel`.

`components/ui/badge.tsx` now ships `success` and `warning` variants alongside shadcn's
four, styled from `--color-success` / `--color-warning` the same way `destructive` is
styled from `--color-danger`.

Lead pipeline stages (§ above) are edited through a `<Select>`, not displayed as a status
badge anywhere today, so they're intentionally untouched by this pass.

## 4. Empty states

Use `components/ui/empty-state.tsx` (title + description) or a single muted `<p>` inside
the panel. Rules:

- Say what **would** be here and how it gets here: *"No leads yet. Capture a walk-in with
  the form above."*
- Never an error tone for an expected-empty list.
- Never placeholder/fake rows.

### Missing DataGrant — neutral, non-judgemental

A missing grant is **not an error and not a gap to be closed**. Personal health data is
CLIENT-owned; the member choosing not to share is the system working correctly.

- **Do:** *"Progress not shared."*
- **Don't:** *"Member has not granted access"* (implies withholding),
  *"No data available"* (implies a fault), or any *"Ask member to share"* prompt — that
  turns a privacy decision into pressure from someone with authority over them.
- Same neutral register as any other empty state. No warning colour, no icon.

## 5. Component rules

- shadcn primitives live in `components/ui/` and carry **no business logic**.
- Base UI `Select` shows the raw value unless given a children render-prop —
  always map through the module's `*-labels.ts`.
- Admin chrome in `components/admin/`; module UI in `modules/<m>/components/`.
- Loading: route-level `loading.tsx` + panel skeletons (ADR-0009). Skeletons mirror the
  real layout so nothing shifts; header placeholders are grey bars, never duplicated copy.
