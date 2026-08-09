---
name: bootstrap-agent-os
description: Use once, at the very start of the project, or when the user asks to set up/scaffold the repo from scratch. Creates the baseline folder structure, docs, and config the other skills and rules assume already exist. Do not re-run once the project has real feature code — use implement-feature/implement-admin-feature instead.
---

# Bootstrap agent OS

One-time scaffold so later rules and skills (which assume certain folders
and docs exist) have something real to attach to.

## Steps

1. Confirm `docs/PRD.md`, `docs/permissions.md`, `docs/MVP_ROADMAP.md`
   exist. If missing, ask the user for the content rather than inventing
   product decisions — this project's rules explicitly defer to these
   files as source of truth.
2. Create the Next.js App Router skeleton matching architecture.mdc:
   - `app/(admin)/roster/`, `app/(admin)/renewals/`, `app/(admin)/crm/`,
     `app/(admin)/plans/`, `app/(admin)/attendance/` (one route group per
     PRD module currently in scope — check `orient` output for what's
     actually next, don't scaffold all M1–M13 at once).
   - `components/ui/`, `components/<module>/`
   - `lib/api/`, `lib/hooks/`, `lib/auth/`, `lib/permissions/`
3. Create `docs/PROGRESS_LOG.md` (empty, header only) and
   `docs/postman/gym-saas.postman_collection.json` (empty collection with
   module folders per M1–M13).
4. Set up `lib/auth/session.ts` for Supabase email OTP session
   verification (server-only) — the foundation every permission check in
   security-data-access.mdc builds on.
5. Set up `e2e/` folder for Playwright, matching
   playwright-e2e-testing.mdc conventions.
6. Confirm `.cursor/rules/` and `.cursor/skills/` are committed to git
   (not gitignored) — they're team config, not personal.
7. Report the created structure back and stop — do not start implementing
   feature logic in the same pass. Hand off to `orient` for the next
   session.
