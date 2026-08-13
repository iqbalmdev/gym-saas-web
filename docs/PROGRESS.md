# Progress

Living project stage for agents and humans. Newest log entries first. Do not delete old log entries.

## Current stage

| Area | Status |
|---|---|
| Agent OS (rules, skills, docs) | Done — drift from `e537810` repaired; Cursor + Claude Code parity |
| Architecture plan + SOLID/DI | Done (ADR-0003, ADR-0004) |
| Matt Pocock skills | Done (`.agents/skills`) |
| Postman API collection | Done — **sibling clone + Postman cloud** (`gym-saas.code-workspace`; no vendored `postman/` in web) |
| Client/Admin auth guide | Done — `docs/api/client-auth.md` |
| Auth research notes | Archived — `docs/archive/research/` |
| MCP (Context7, Postman, GitHub, Supabase, Vercel, Playwright) | Configured + connected in Cursor |
| Playwright E2E skill | Done — `.cursor/skills/playwright-e2e-testing` (from fugazi/test-automation-skills-agents) |
| Next.js app scaffold | Done — App Router + Clean Arch ports/adapters (build green) |
| Feature modules | M1 auth; M2 Settings-first + invites; **M3 membership invites + my-data-grants**; **M4 plans/addons**; **roster / attendance / renewals**; **M11 leads** |
| Admin CRM-light chrome | Done — collapsible sidebar + light/dark tokens + mobile drawer + Settings-only first-run |

**Summary:** Roster, attendance desk, renewals inbox, and client my-data-grants wired against Postman tip `91d4aba`. Plans + Leads + membership invites remain live. Agent OS repaired after the `e537810` rule drift; stack + folder decisions recorded as ADR-0006 / ADR-0007.

## Next up

**Team setup (two contributors — sequence matters, see ADR-0007):**

1. Tooling: Prettier + ESLint architecture rules + Husky/lint-staged + **CI on PRs** (ADR-0006).
2. shadcn/ui install + `data-theme` variant and token alias onto `crm-tokens.css`.
3. UI/UX design-system doc (theme tokens, table density, status badges, empty states).
4. Module-folder migration (ADR-0007) — single commit, one person in the tree.
5. Split module ownership between contributors; adopt feature branches + PRs.

**Product:**

6. Assign trainer / trainer list when Postman exposes a list endpoint.
7. Deploy gym-backend with `GOOGLE_OAUTH_REDIRECT_ORIGINS` + Supabase redirect URL for web Google callback.
8. Optional: deeper renewals UX (filters, member name join).

## Log

### 2026-08-14 — Tooling + CI (ADR-0006 §3)

- **Finding:** `npm run lint` was **already failing with 15 errors** before any change — nothing ran it (no CI). Exactly the gap ADR-0006 exists to close.
- Prettier (`.prettierrc.json`, `.prettierignore`) + `prettier-plugin-tailwindcss`. Markdown is **excluded** — ADRs/PROGRESS/plan are hand-authored; reverse by deleting one line if the team disagrees.
- ESLint now encodes the architecture (ADR-0004) so it fails a build, not a review: ports may not import adapters/features/UI; `lib/api/client` + `*-adapter` + `e2e-fixtures` unreachable from features/components/app (composition, errors, endpoints stay allowed); no raw `fetch` outside `lib/api`; named exports only outside `app/`; `no-explicit-any`.
- Pre-existing violations resolved, not silenced: one real adapter-boundary exception (`google-oauth-start.ts` builds a redirect URL, not transport) and four `set-state-in-effect` cases (localStorage / `location.hash` / DOM theme — all unreadable during SSR). Each carries a targeted disable **with the reason**. Playwright's `use()` fixture is a `rules-of-hooks` false positive, scoped off for `e2e/**`.
- Husky + lint-staged pre-commit (`lint-staged` then `npm test` — unit suite runs in ~280ms). CI (`.github/workflows/ci.yml`): lint · typecheck · unit, plus a Playwright job with report artifact. Node pinned to **22** (`.nvmrc`, `engines`), matching Vercel.
- Claude Code parity completed: 23 Matt Pocock skills symlinked into `.claude/skills/` (30 total). `code-review` deliberately skipped — it would shadow Claude Code's built-in. `.claude/settings.local.json` gitignored.
- **Lockfile registry fix (would have broken CI on day one).** A contributor installs through a corporate Azure Artifacts mirror set in a user-level `.npmrc`, so npm recorded `*.pkgs.visualstudio.com` hosts in `resolved`. GitHub runners cannot reach those, so `npm ci` would fail. 4 such entries were already committed; installing the tooling added 15 more. All 19 rewritten to `registry.npmjs.org` (same artifacts — it is an upstream mirror, so integrity hashes are unchanged). Guarded by `scripts/lockfile-registry.mjs` + `npm run lockfile:check`, wired as the first CI job that every other job `needs`, and `npm run lockfile:fix` repairs a regression byte-identically. **Any `npm install` on that machine reintroduces it — run `lockfile:fix` before committing.**
- **Outstanding, deliberately bundled with the ADR-0007 migration:** the one-off `npm run format` (156 files). Enable `format:check` in CI in that same commit (currently commented out, so CI is green today).
- **Tailwind canonical classes — do last, after shadcn.** 466 occurrences of `[var(--x)]` across 24 files could become the `(--x)` shorthand. Purely cosmetic (both are valid Tailwind 4, no deprecation), and shadcn token aliasing (ADR-0006) will rewrite many of the same `className` strings — so migrating before that means touching them twice. Order: module move + format → shadcn + tokens → canonical classes.
- **`nanoid` advisory accepted, not fixed** (GHSA-2v37-7h3g-55p8, `<3.3.18`, CWE-835). 3.3.18 is not resolvable from the reachable registry, and npm's only proposed fix is downgrading `next` to 9.5.5 (semver-major). Judged low practical risk: nanoid arrives solely via `postcss` ← next/tailwind, so it is **build-time only and never shipped to the browser**, and the vulnerable path needs a custom generator invoked with size 0, which postcss does not do. Revisit with an npm `overrides` pin if/when 3.3.18 publishes. `npm audit` is deliberately not gated in CI. Note `npm audit fix` cannot run at all here: it rebuilds the full tree including optional platform packages, and `@tailwindcss/oxide-wasm32-wasi@4.3.3` 404s on both the mirror and public npm. Harmless for normal installs — it is `optional: true`, so `npm ci` skips it (macOS takes `oxide-darwin-arm64`, CI takes `oxide-linux-x64-gnu`).
- Verified: `npm run verify` (lockfile + lint + typecheck + 53 tests) passes; lint clean at `--max-warnings=0`.

### 2026-08-14 — Agent OS drift repair + stack/folder ADRs (no code change)

- **Cause:** `e537810` ("refresh Cursor rules and skills from PRD orbit bundle") imported a bundle describing a *different* app — Next 15, React Query, react-hook-form, direct Supabase reads, `lib/hooks/`, `lib/permissions/`, `cn()`, `docs/MVP_ROADMAP.md`, `docs/PROGRESS_LOG.md`. None of it existed here. Nothing could detect the contradiction.
- **Restored to pre-drift:** rules `architecture`, `testing`, `progress-log`; all 7 skills. `playwright-e2e-testing` had lost all 17 `references/` links (files still on disk); `sync-postman-collection` was instructing agents to vendor a collection JSON that `.gitignore` blocks.
- **Merged (kept good new content):** `code-quality` (+ style bar), `error-handling` (+ Server Action result contract), `git-conventions` (conventional commits, branches, PR contents; re-added secrets/force-push safety).
- **Rewritten to match reality:** `001-tech-stack` (Next 16 + explicit *not installed* list), `000-project-context` (`STAFF_UNASSIGNED`, real doc paths), `security-data-access` (S3 enforces; web gates and never fakes — no RLS/SQL in this repo).
- **Deleted:** `cursor-database.mdc` (SQL/RLS guidance; this repo never touches Postgres).
- **Claude Code parity:** `CLAUDE.md` → `AGENTS.md` symlink; 7 skills symlinked into `.claude/skills/`; `.claude/settings.json` allowlist. AGENTS.md rules table now marks always-on vs glob, since Claude Code does not read `.mdc`.
- **ADR-0006** UI + tooling stack: adopt shadcn/ui (keep `data-theme`, alias tokens), Prettier/ESLint/Husky + **CI as the enforcement boundary**; defer TanStack Query (access token is httpOnly — would need token exposure or a 29-endpoint BFF) and TanStack Form (not yet justified).
- **ADR-0007** module-folder architecture: accepted, **implementation deferred**. Target tree, hotspot fix via per-module `services.ts`, and required sequencing recorded. `architecture-plan.md` §5 stays authoritative until the migration lands.
- Verified: every path referenced by rules/skills resolves (except the deliberate forward-looking `lib/client-state/` glob). `typecheck` clean, 53 unit tests pass. No source changed. Not committed.

### 2026-08-12 — Roster + attendance + renewals + my-data-grants (tip `91d4aba`)

- Postman sibling tip `91d4aba` (Roster, Attendance, Subscriptions renewals-due, Profile & Progress / my-data-grants under Membership Invites).
- Admin: `/admin/members` roster (list ACTIVE, offboard, check-in block); `/admin/attendance` desk-mark + day list; `/admin/renewals` renewals-due + payment patch.
- Client: `GET`/`PUT` `/gym-orgs/:id/my-data-grants` after accept; sticky DOB/HEIGHT/WEIGHT.
- Authz: roster/attendance/renewals = Auth + STAFF + gym tenant (API ADMIN); no DataGrant. Data grants = CLIENT + ACTIVE membership.
- Ports/adapters/actions/UI + E2E fixtures + Playwright specs. Docs `docs/api/roster.md`, `attendance.md`, `subscriptions.md`; membership-invites updated. No invent endpoints.

### 2026-08-11 — Client membership invite accept

- `/client` lists `GET /membership-invites/inbox` and accepts via `POST /membership-invites/:id/accept`.
- CLIENT session only; optional grant checkboxes. Required vitals stay server-side.
- `my-data-grants` still deferred. No invent endpoints.

### 2026-08-09 — Membership Invites Admin (M3)

- Postman sibling pull `acc01be` → `ca849e0` (Membership Invites + Subscriptions).
- Ports/adapter/actions for create, list, revoke; `/admin/members` replaces stub.
- Auth: STAFF session + gym affiliation; API enforces ADMIN. No DataGrant (gym-owned invites).
- Docs `docs/api/membership-invites.md`. Client inbox/accept deferred. No invent endpoints.

### 2026-08-08 — Postman sync tip `acc01be` → cloud

- Sibling `gym-backend-postman` `git pull` 7a2d9bf → `acc01be` (Membership Invites Examples + guide link).
- Postman MCP `putCollection` + Dev/Local envs (`baseUrl` prod/local, `lane=STAFF`).
- Collection `updatedAt` 2026-08-08T17:31:47Z; folders include **Membership Invites** (7 requests in sibling; 16 Examples SSOT).
- MCP may compact Examples; sibling/GitHub remains Examples SSOT. Auth/staff-invite guides unchanged. No commit.

### 2026-08-08 — Gym name on invites + Plans + Leads

- Inbox: parse/display embedded `gym.name` (was stripped by Zod). Admin staff invites + shell show active gym name.
- **Plans** (`/admin/plans`): ports/adapter, create BASE/ADDON, list filter, activate, soft delete. Docs `docs/api/plans.md`.
- **Leads** (`/admin/crm`): ports/adapter, create (example walk-in), status pipeline, due follow-ups, delete. Docs `docs/api/leads.md`.
- Composition + E2E fixtures wired. No invent endpoints (Postman tip `7a2d9bf`).

### 2026-08-08 — Google OAuth login (web + backend redirect_to)

- Web: `completeGoogle` port/adapter/action; login **Continue with Google** → lane → API start with `redirect_to`; `/auth/google/callback` reads hash, keeps Google tokens, session cookie, post-auth redirect.
- Backend (`gym-backend`): allowlisted `?redirect_to=` via `GOOGLE_OAUTH_REDIRECT_ORIGINS`; start works in production without Postman helper.
- Docs: `docs/api/client-auth.md` Google section. Unit + Playwright coverage (fixtures).
- Live Google needs backend deploy + Supabase redirect allowlist for `{web}/auth/google/callback`.

### 2026-08-08 — Postman sync tip `7a2d9bf` → cloud

- Sibling `gym-backend-postman` `git pull` 7ae3891 → `7a2d9bf` (Leads, Plans; inbox embeds `gym`).
- Postman MCP `putCollection` + Dev/Local envs (`baseUrl` prod/local, `lane=STAFF`).
- Collection uid `33631273-e6dafd3b-8829-4ba6-885f-763020fc8347` `updatedAt` 2026-08-08T06:44:33Z; folders Health, Auth, Gym Orgs, Staff Invites, Leads, Plans.
- Updated `docs/postman-sync.md`, `docs/api/staff-invites.md` (inbox `gym`), client-auth tip SHA. Auth OTP contract unchanged.
- Examples may be trimmed on MCP inject; sibling remains Examples SSOT. Temp cleaned. No commit.

### 2026-08-07 — Rules/skills: Next.js + state-management best practices

- Added `state-management.mdc` (server data / URL / useState / Context / Zustand UI-only).
- Rewrote `nextjs-app-router.mdc` (RSC default, Server Actions, client leaves).
- Updated `architecture`, `code-quality`, `testing`; skills `orient`, `implement-feature`, `implement-admin-feature`, `bootstrap-agent-os`; `AGENTS.md`.
- No Zustand package install yet — document first; scaffold when a slice needs shared client chrome.

### 2026-08-07 — Agent OS lean pass (rules + skills + docs)

- **Rules:** Short `.mdc` files; `testing` / `architecture` / `error-handling` / theme / Next use globs; Settings-first in architecture + nextjs rules.
- **Skills:** Trimmed orient, implement-feature, sync-postman, verify-api-flow, bootstrap-agent-os.
- **Docs:** Index `docs/README.md`; archived research, playbook, Postman MCP dump → `docs/archive/`; thin `docs/agents/*` stubs for Matt skills; slim `AGENTS.md` / GETTING-STARTED / root README.

### 2026-08-06 — Settings-first Staff onboarding (plan A)

- Post-auth: STAFF + 0 gyms → `/admin/settings` (same for `isNewUser` true/false).
- Admin shell `settings-only` mode: Settings nav only; ops routes under `(ops)` redirect to Settings when empty.
- Settings composes create gym + invite inbox + staff invite admin panel.
- `/onboarding/create-gym` (+ onboarding layout) redirects to Settings.
- Create gym refreshes session → stay on Settings; accept invite → `/admin`.
- Unit: `admin-nav`, `resolvePostAuthPath`. E2E: login destinations, Settings-only shell, inbox accept.
- Docs: `architecture-plan` §7, `staff-invites.md`, research note superseded banner.

### 2026-08-06 — Multi-root Postman workspace + sync skill/docs (C/D)

- Cloned sibling `/Users/iqbal/Projects/gym-backend-postman` @ `7ae38910`.
- Added `gym-saas.code-workspace` (web + postman roots).
- Rewrote **sync-postman-collection**: prefer sibling `git pull` → Postman MCP inject; GitHub MCP fallback.
- Updated `docs/postman-sync.md`, `mcp-setup.md`, `GETTING-STARTED.md`, rule `postman-sync.mdc`, `architecture.mdc`, `AGENTS.md`, **orient**, **verify-api-flow**, **implement-feature**, `README.md`.
- Still no vendored `postman/*.json` in web repo.

### 2026-08-06 — Staff invites (create / list / revoke / inbox / accept)

- Ports + Zod adapter from Postman Staff Invites; composition + E2E fakes.
- Admin **Settings**: invite by staff code (TRAINER/ADMIN), list, revoke.
- Onboarding **create-gym**: invitee inbox + accept → refresh session → `/admin`.
- Docs: `docs/api/staff-invites.md`. Unit + Playwright coverage.

### 2026-08-06 — Admin/Client nav: space-between + mobile drawer

- Headers use `justify-between`: brand left, Sign out (and user) right — Admin shell, Client, Onboarding.
- Admin: sidebar off-canvas under `md`; hamburger opens drawer; desktop collapse rail unchanged.
- E2E: mobile header + open navigation smoke.

### 2026-08-06 — Postman cloud inject OK (`7ae38910`)

- Tip `7ae3891099c99bad605282e18f0f85e2b26a43d5` → Postman MCP `putCollection` + `putEnvironment` (Dev/Local).
- Collection uid `33631273-e6dafd3b-8829-4ba6-885f-763020fc8347` (`updatedAt` 2026-08-06T12:47:55Z); folders Health, Auth, Gym Orgs, Staff Invites.
- Dev `baseUrl` = Vercel prod, `lane=STAFF`. Auth guide unchanged beyond prior SHA bump. Temp cleaned; no commit.

### 2026-08-06 — Postman sync retry (pull OK, inject 401)

- Tip still `7ae3891099c99bad605282e18f0f85e2b26a43d5` (Staff Invites folder; Auth still has `isNewUser` + `LANE_REQUIRED`).
- GitHub MCP pull OK → `/tmp/gym-postman-sync/` (ephemeral; cleaned). Prep payloads ready (Dev `baseUrl` = Vercel prod, `lane=STAFF`).
- Postman MCP: `mcp_auth` reports success twice; `getCollections` / `getEnvironments` still **401 Invalid API Key**. Cloud inject skipped.
- `docs/api/client-auth.md` — publish SHA → `7ae38910` only (no OTP contract change). `docs/postman-sync.md` Last verified refreshed.
- No commit.

### 2026-08-06 — Commits + Postman tip pull `7ae38910`

- Landed 8 sequential commits (scaffold → Postman SSOT → ports → login → create-gym/client → Admin shell → E2E → docs).
- Pulled `abdulhasibn/gym-backend-postman` tip `7ae38910` to `/tmp/gym-postman-sync/` (folders: Health, Auth, Gym Orgs, Staff Invites).
- Cloud inject still **401 Invalid API Key** on Postman MCP after re-auth. Manual Desktop Import URLs recorded in `docs/postman-sync.md`.
- Temp dir cleaned; architecture.md / architecture-plan.md left at committed plan (untouched).

### 2026-08-05 — Login: email first; lane only for isNewUser

- Returning users: email → OTP (no lane chooser).
- New users: email → lane → OTP; create-gym remains post-login Staff gate only.
- Docs + E2E updated to match `client-auth.md`.

### 2026-08-05 — Fix create-gym false VALIDATION_ERROR

- POST `/gym-orgs` 201 body has no `isOwner`; adapter required it → Zod fail → calm “check details” after a successful create.
- Split create vs list schemas; default `isOwner: true` for creator; only send optional contact fields when set.

### 2026-08-05 — Playwright E2E skill alignment

- POM fixtures (`e2e/fixtures/pages.fixture.ts`); specs inject pages (no `new` in specs).
- Login coverage: lane-first, disabled states, OTP Staff→create-gym / Client→/client.
- `reuseExistingServer: false` so E2E always uses fixture-enabled `next start`.
- Fix: Admin/onboarding layouts rethrow `redirect()` errors (catch was swallowing create-gym gate).

### 2026-08-05 — Fix auth UX to architecture §7 (lane first)

- Login: lane → email → OTP (removed email-first + “Check your email” continue).
- Verify still sends `lane` only when API `isNewUser` is true.
- ThemeToggle: mount-safe to stop hydration mismatch on `/login`.
- Admin layout: empty gym list → create-gym; list/network errors no longer bounce to onboarding (create loop).
- Documented flow in `docs/architecture.md` + plan §7.

### 2026-08-05 — isNewUser lane chooser + create-gym gate

- Auth adapter/ports: Request OTP returns `isNewUser`; verify `lane` optional for returning users.
- Login steps: lane → email → OTP; post-auth via `resolvePostAuthPath`.
- `/onboarding/create-gym` + Admin redirect when `gymOrgs` empty; `/client` for CLIENT lane.
- Root `README.md` (rules/skills); research `docs/research/2026-08-05-auth-isnewuser-lane-gym-gate.md`.
- Tests: unit path/schema; E2E fixtures (`GYM_SAAS_E2E_FIXTURES`) for SSR gym gate + OTP; lane step, empty-gym redirect, client home.

### 2026-08-05 — Postman sync from GitHub (`isNewUser`)

- Pulled `abdulhasibn/gym-backend-postman` tip `d42602a8` → `/tmp/gym-postman-sync/` (ephemeral).
- Auth contract change: Request OTP returns `{ status, isNewUser }`; Verify includes `lane` only when `isNewUser: true` (`LANE_REQUIRED` if missing). Synced into `docs/api/client-auth.md`.
- Postman cloud inject **failed** (`401 Invalid API Key` on Postman MCP after `mcp_auth`). Manual: Import raw URLs in Postman Desktop, or re-login Postman MCP and re-run sync skill.
- Temp dir cleaned; no commit.

### 2026-08-04 — Test scaffold (Vitest + Playwright)

- Unit seams: theme preference, session model encode/decode, auth error display (`npm test`).
- E2E: login gate, theme toggle, collapsible Admin sidebar with STAFF cookie fixture (`npm run test:e2e`); POM under `e2e/pages/`.
- Documented runners in `docs/architecture.md`. Playwright pinned ~1.48 for macOS 13 arm64.

### 2026-08-04 — Light / dark theme

- Token maps in `lib/theme/crm-tokens.css` via `html[data-theme]`; FOUC-safe boot script + `ThemeProvider` / `ThemeToggle`.
- Preference in `localStorage` (`gym-saas-theme`); first visit follows system. Toggle in Admin header, drawer, and login.

### 2026-08-04 — Admin CRM-light chrome

- Soft cool canvas gradient, white large-radius panels, black active pills (`lib/theme/crm-light.css`, `admin-shell`).
- Narrow icon rail + top pill nav for Gym modules (Renewals, Leads, Members, etc.); stub pages share `AdminStubPage`.
- Visual language only — not SugarCRM case-management content. Build green.

### 2026-08-04 — M1 Admin OTP login

- `/login`: email → OTP verify; STAFF lane hard-coded; product copy (no architecture jargon).
- Server Actions → `createAppServices()` ports; httpOnly session cookie (ADR-0005).
- `/admin` guarded; shows `roleCode` / `staffCode`; sign out; STAFF_UNASSIGNED nudge to Settings.
- Build green.

### 2026-08-04 — Next.js Clean Architecture scaffold

- Next.js 16 App Router + Tailwind 4 + Zod; `npm run build` green.
- Layers: `lib/ports` (AuthGateway, GymOrgs*), `lib/api` (client, adapters, `createAppServices` DI root), `lib/features/*` use-cases, `lib/display`, `lib/theme/crm-light.css`.
- Routes: `/login`, `/admin/*` stubs, reserved `/trainer` + `/client`.
- Session storage still open (A2) — stub in `lib/auth/session.ts`.

### 2026-08-04 — verify-api-flow STAFF OTP smoke (prod)

- Email `mohammediqbalbe@gmail.com` against `https://gym-backend-lovat-mu.vercel.app`.
- Request OTP `202 OTP_SENT` → Verify `200` → `/auth/me` `200` → `GET /gym-orgs` `200` `{ gymOrgs: [] }`.
- User: `lane=STAFF`, `roleCode=STAFF_UNASSIGNED`, `staffCode=STF-1E0E7EEAD126` (first provision / unassigned owner path).
- Ran via direct HTTP (Postman MCP still 401). Tokens not stored in repo.

### 2026-08-04 — Dropped root README

- Removed root `README.md` (use `docs/GETTING-STARTED.md` + `docs/PROGRESS.md` as entry points).

### 2026-08-04 — Playwright E2E skill vendored

- Added `.cursor/skills/playwright-e2e-testing` from [fugazi/test-automation-skills-agents](https://github.com/fugazi/test-automation-skills-agents/tree/main/skills/playwright-e2e-testing) (SKILL.md + LICENSE + 17 references).
- Linked from `AGENTS.md` and `.cursor/rules/testing.mdc`. Ready to scaffold Next.js base structure next.

### 2026-08-04 — Postman cloud as working SSOT (no local JSON)

- Removed vendored `postman/` from this repo to avoid dual source of truth.
- Working SSOT: Postman cloud; publish SSOT: `abdulhasibn/gym-backend-postman`.
- Updated skill/rule/docs (`sync-postman-collection`, `postman-sync.md`, verify-api-flow, GETTING-STARTED, mcp-setup, README, client-auth).
- Verified prod API: `GET https://gym-backend-lovat-mu.vercel.app/health` → `200` `{"status":"ok"}`.
- Note: Postman MCP briefly returned 401 — re-login MCP if inject/env updates fail.

### 2026-08-04 — Postman pull + MCP inject

- Tip `4de631e6…` from `abdulhasibn/gym-backend-postman`; `postman/` refreshed (content unchanged).
- Injected into Postman **My Workspace** (`e9147605-…`): collection `Gym Backend API` (`33631273-e6dafd3b-…`), envs Dev + Local.
- `docs/api/client-auth.md` unchanged (no contract delta).
- Caveat: cloud collection missing saved **Examples** (MCP putCollection schema); Examples remain in local JSON.
- No commit.

### 2026-08-04 — Postman sync skill + MCP inject pipeline

- Added skill `sync-postman-collection` and rule `postman-sync.mdc`: GitHub MCP → `postman/` → Postman MCP inject (`createCollection`/`putCollection` + envs).
- Expanded `docs/postman-sync.md` with pull-only and pull+inject prompts.

### 2026-08-04 — Postman sync via GitHub MCP

- Verified `abdulhasibn/gym-backend-postman` tip `4de631e6…` with GitHub MCP (`list_commits` + `get_file_contents`); local `postman/` already matched (no overwrite).
- Added `docs/postman-sync.md` — agent prompt + MCP tools to pull future collection updates into this repo.

### 2026-08-04 — Client auth research (Admin web)

- Wrote `docs/research/2026-08-04-client-auth-admin-web.md` (OTP/Google/session/gym-orgs for STAFF Admin; ports mapping; error UX matrix; citations).
- Synced `docs/api/client-auth.md` to WhatsApp integration guide facts corroborated by Postman (kept Admin STAFF hard-code + Related links).
- Primary sources: WhatsApp guide, vendored Postman, architecture-plan, PRD/product-flows, verify-api-flow.

### 2026-08-03 — gym-saas-web canonical Agent OS + Postman

- Created `~/Projects/gym-saas-web` as the continuation repo.
- Carried forward rules, skills, architecture plan, playbook, Matt Pocock skills from prior bootstrap.
- Vendored Postman collection/envs from https://github.com/abdulhasibn/gym-backend-postman
- Added `docs/api/client-auth.md`; refreshed `verify-api-flow` for Gym Backend + Postman MCP.
- Showcase alignment: https://prd-showcase.vercel.app/

### Prior work (gym-admin-web)

- Agent OS bootstrap, multi-persona ADR, Matt skills, Context7, SOLID/DI architecture plan.
