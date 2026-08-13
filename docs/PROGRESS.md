# Progress

Living project stage for agents and humans. Log entries live one-per-file in `docs/progress/`.

## Current stage

| Area | Status |
|---|---|
| Agent OS (rules, skills, docs) | Done — drift from `e537810` repaired; Cursor + Claude Code parity |
| Tooling + CI | Done — Prettier/ESLint architecture rules/Husky/lint-staged + GitHub Actions (ADR-0006) |
| Folder architecture | Done — module folders `lib/modules/<module>/` (ADR-0007) |
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

**Summary:** Roster, attendance desk, renewals inbox, and client my-data-grants wired against Postman tip `91d4aba`. Plans + Leads + membership invites remain live. Agent OS repaired after the `e537810` rule drift; tooling + CI landed (ADR-0006) and the tree is now module-folders (ADR-0007).

## Next up

**Team setup:**

1. **shadcn/ui** — install, point the dark variant at `[data-theme="dark"]`, alias its token names onto `lib/theme/crm-tokens.css`. Do **not** rewrite the token map (ADR-0006).
2. **UI/UX design-system doc** — after shadcn, so it documents real tokens: theme tokens, table density, status badges (payment/membership/lead pipeline), empty states incl. missing-DataGrant copy.
3. **Tailwind canonical classes** — 466 `[var(--x)]` → `(--x)` across 24 files. Cosmetic; last, because shadcn rewrites the same `className` strings.
4. **Split `lib/api/e2e-fixtures.ts`** (1173 lines) into a shared kernel + per-module fakes — its own commit (ADR-0007 consequences).
5. **Module ownership split** with Iqbal, then feature branches + PRs.

**Product:**

6. Assign trainer / trainer list when Postman exposes a list endpoint.
7. Deploy gym-backend with `GOOGLE_OAUTH_REDIRECT_ORIGINS` + Supabase redirect URL for web Google callback.
8. Optional: deeper renewals UX (filters, member name join).

## Log

Entries live one-per-file in [`docs/progress/`](progress/), named
`YYYY-MM-DD-<slug>.md` — newest sorts last by filename.

**Why one file per entry:** this file used to be appended at the top by every
contributor, so it conflicted on every parallel change (ADR-0007). Add a new
file; never edit an old one.

