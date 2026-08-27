# Progress

Living project stage for agents and humans. Log entries live one-per-file in `docs/progress/`.

## Current stage

| Area | Status |
|---|---|
| Agent OS (rules, skills, docs) | Done — drift from `e537810` repaired; Cursor + Claude Code parity |
| Tooling + CI | Done — Prettier/ESLint architecture rules/Husky/lint-staged + GitHub Actions (ADR-0006); `typecheck` runs `next typegen` first so `LayoutProps` exists on a clean CI checkout |
| Folder architecture | Done — top-level `modules/<module>/`; `lib/` is shared infrastructure (ADR-0007, ADR-0008). E2E fixtures split into `lib/api/e2e/store.ts` (shared state) + nine per-module fakes, closing ADR-0007's last deferred consequence — no shared-file hotspots remain |
| UI foundation | Done — shadcn/ui on `data-theme`, tokens aliased to the CRM palette (ADR-0006) |
| Architecture plan + SOLID/DI | Done (ADR-0003, ADR-0004) |
| Matt Pocock skills | Done (`.agents/skills`) |
| Postman API collection | Sibling at **`9b0b561`** (Convert Lead + trainer list + Nutrition/Coaching/Health Sync). Cloud inject still blocked — Postman MCP 401; Desktop Import the sibling JSON |
| Client/Admin auth guide | Done — `docs/api/client-auth.md` |
| Silent session refresh | Done — `proxy.ts` rotates the access/refresh pair via `POST /auth/refresh` before it expires; cookie `Max-Age` decoupled from the access-token TTL (`2026-08-16` fix, see progress log) so it survives to be refreshed instead of the browser dropping it at the 1h mark. Verified live against prod (`2026-08-16`): rotation + 401-on-stale-token both confirmed; Google-lane compatibility inferred high-confidence (shared Supabase issuer), not directly browser-tested |
| Auth research notes | Archived — `docs/archive/research/` |
| MCP (Context7, Postman, GitHub, Supabase, Vercel, Playwright) | Configured + connected in Cursor |
| Playwright E2E skill | Done — `.cursor/skills/playwright-e2e-testing` (from fugazi/test-automation-skills-agents) |
| Next.js app scaffold | Done — App Router + Clean Arch ports/adapters (build green) |
| Feature modules | M1 auth; M2 Settings-first + invites; **M3 membership invites + my-data-grants**; **M4 plans/addons**; **roster / attendance / renewals**; **profile & progress**; **M11 leads** |
| Admin CRM-light chrome | Done — Base UI `Sidebar` primitive (icon rail + `Sheet` mobile drawer + cookie-persisted state), light/dark tokens, Settings-only first-run; Client persona shares the same header atoms |
| Admin navigation latency | Done — page shells do no network work; `loading.tsx` per ops route; filter tabs are `<Link>` in the shell (was a raw `<a>` full-page reload) (ADR-0009) |
| Client data layer | Done — **TanStack Query v5** across all six Admin modules (ADR-0011): RSC `prefetchQuery` + `<HydrationBoundary>` for first paint, `/api/*` route handlers for refetch, mutations wrapping the existing Server Actions so the auth→lane→tenant gate never moved. Retired all `*-data.tsx`, every `useOptimistic` block, and 18 of 22 `router.refresh()` sites. Navigation between ops screens now serves from cache instead of re-paying ~400ms per hop. CLIENT persona migrated too; the 4 remaining `router.refresh()` calls are session creation and Admin-shell-mode changes, which cache invalidation cannot re-render |

**Summary:** Roster, attendance desk, renewals inbox, and client my-data-grants wired against Postman tip `9b0b561` (sibling pulled 2026-08-19; cloud collection still waiting on Postman MCP re-auth). Plans + Leads + membership invites remain live. Agent OS repaired after the `e537810` rule drift; tooling + CI landed (ADR-0006). Domain slices live at top-level `modules/` (ADR-0008 amending ADR-0007). Admin shell rebuilt on Base UI's `Sidebar` primitive, replacing the hand-rolled collapsible nav. Admin navigation reworked to stream the page shell and stop reloading the document on filter clicks (ADR-0009).

## Next up

**Team setup:**

1. ~~Apply the status-badge scale~~ — **Done.** `lib/ui/status-tone.ts` (`StatusTone` + `statusToneBadgeVariant()`), `badge.tsx` got `success`/`warning` variants, and every domain status (`roster-panel`, `members-admin-panel`, `membership-invite-inbox`, `staff-invites-admin-panel`) is now a `<Badge>` with the correct tone — no more bare-text statuses, no more `roster-panel` payment badges all rendering `outline`.
2. **Adopt shadcn components per surface** — Done: `table`/`select`/`badge`/`checkbox`/`radio-group`/`textarea` landed across every Admin panel and the auth flows (roster, attendance, leads, members, plans, staff-invites, login, Google callback, create-gym, data-grants, membership-invite inbox); `dialog`/`dropdown-menu` installed but not yet consumed by a screen.
3. **Module ownership split** with Iqbal, then feature branches + PRs — now unblocked on the tooling side: the last shared hotspot (`e2e-fixtures.ts`) is split per module.
4. ~~Embed `gymOrgId` / `gymName` in the session~~ — **no longer needed for latency**: the gym lookup is cached client-side by TanStack, so navigation no longer re-pays it. Still an option if the *first* load's sequential hop matters (would need HMAC signing first — ADR-0010 work is stashed, not landed).

**Product:**

6. ~~Assign trainer in Admin~~ — **Done.** Members roster picker uses Gym Orgs `GET /gym-orgs/:id/trainers`; assign posts `trainerProfileId` on the roster writer. See `docs/progress/2026-08-19-assign-trainer-roster.md`.
7. ~~Profile & Progress~~ — **Done.** Client `/client/profile` + Admin/Trainer grant-aware member detail; Trainer assigned roster via `GET /my-assigned-members`. Profile menu owns dark mode for Admin/Trainer/Client. See `docs/progress/2026-08-26-trainer-profile-menu.md`.
7b. ~~Client sidebar~~ — **Done.** Member shell mirrors Admin sidebar: Home, Profile, Nutrition, Diet, Workouts, Health Sync (placeholders until those Postman modules are wired). See `docs/progress/2026-08-27-client-sidebar.md`.
7c. ~~Client pattern alignment~~ — **Done.** `ClientStubPage` = `AdminStubPage`; shell/user/initials match Admin; debug adapter log removed. See `docs/progress/2026-08-27-client-pattern-alignment.md`.
7d. ~~Sign-in screen redesign~~ — **Done.** Split-screen auth: tinted hero panel (brand + what the product does) beside a surface form column; larger controls, letter-spaced OTP field, Google brand mark. Tokens only; login POM names unchanged so all 15 login E2E specs pass. See `docs/progress/2026-08-27-auth-screen-redesign.md`.
7e. ~~Rename to **Yeah Buddy**~~ — **Done.** UI display name + `YB` tile across Admin/Client/auth chrome and page metadata; repo/package identity stays `gym-saas-web`. The full E2E run it prompted (first since `6ec42c4`) caught two regressions from that commit, both fixed: Sign out returned a server error (cookie mutation in a Server Component — now the existing `signOutAction`), and `/admin/members` gated on `roleCode === 'ADMIN'`, hiding the roster from every other staff role (now gated on `TRAINER`). See `docs/progress/2026-08-27-yeah-buddy-rename.md`.
8. Deploy gym-backend with `GOOGLE_OAUTH_REDIRECT_ORIGINS` + Supabase redirect URL for web Google callback.
9. Optional: deeper renewals UX (filters, member name join).
10. Optional: confirm Google-lane `/auth/refresh` compatibility with an actual browser OAuth round-trip (curl-verified for OTP-lane on `2026-08-16`; Google-lane inferred, not directly hit).

## Log

Entries live one-per-file in [`docs/progress/`](progress/), named
`YYYY-MM-DD-<slug>.md` — newest sorts last by filename.

**Why one file per entry:** this file used to be appended at the top by every
contributor, so it conflicted on every parallel change (ADR-0007). Add a new
file; never edit an old one.

