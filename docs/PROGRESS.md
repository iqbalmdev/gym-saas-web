# Progress

Living project stage for agents and humans. Newest log entries first. Do not delete old log entries.

## Current stage

| Area | Status |
|---|---|
| Agent OS (rules, skills, docs, playbook) | Done |
| Architecture plan + SOLID/DI | Done (ADR-0003, ADR-0004) |
| Matt Pocock skills | Done (`.agents/skills`) |
| Postman API collection | Done — **Postman cloud SSOT** (GitHub publish → MCP inject; no local `postman/` JSON) |
| Client/Admin auth guide | Done — `docs/api/client-auth.md` (synced 2026-08-04 to WhatsApp + Postman) |
| Auth research note (Admin web) | Done — `docs/research/2026-08-04-client-auth-admin-web.md` |
| MCP (Context7, Postman, GitHub, Supabase, Vercel, Playwright) | Configured + connected in Cursor |
| Playwright E2E skill | Done — `.cursor/skills/playwright-e2e-testing` (from fugazi/test-automation-skills-agents) |
| Next.js app scaffold | Done — App Router + Clean Arch ports/adapters (build green) |
| Feature modules | M1 auth with isNewUser + lane chooser; M2 create-gym gate; Client home stub |
| Admin CRM-light chrome | Done — collapsible sidebar + light/dark tokens |
| Unit + E2E test scaffold | Done — Vitest + Playwright (login/lane/create-gym/client) |
| GitHub remote | Done — https://github.com/iqbalmdev/gym-saas-web |

**Summary:** Login uses `isNewUser` for Staff/Client; Staff without a GymOrg must create one before Admin modules; Clients land on `/client`. Next: Phase A plans/renewals; re-login Postman MCP when convenient.

## Next up

1. Admin Phase A: M4 plans → renewals inbox → M3 → M5 → M11 CRM.
2. Re-login Postman MCP and finish cloud inject from tip `d42602a8`.
3. Deepen Client web when Phase B starts.

## Log

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
