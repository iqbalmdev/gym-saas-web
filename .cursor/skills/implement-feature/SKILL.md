---
name: implement-feature
description: Use when building any new feature, route, or module slice for the Gym SaaS Web Admin (Next.js) — e.g. a new roster view, a renewal flow, a CRM pipeline stage. Not for auth/permission-sensitive admin surfaces specifically; use implement-admin-feature for those instead.
---

# Implement feature

Standard build loop for a feature slice. Follow it in order; don't skip to
writing code before step 2.

## Steps

1. **Locate the module.** Map the request to one of M1–M13 from
   `docs/PRD.md`. If it doesn't map cleanly, say so before proceeding.
2. **Check module boundaries** (architecture.mdc). Confirm which folders
   this touches: `app/(admin)/<module>/`, `components/<module>/`,
   `lib/api/`, `lib/hooks/`. Don't reach into another module's internals.
3. **Design the data flow first, in words**: what does the Server
   Component fetch, what does `lib/api` call, what shape does the Express
   API return. If the API shape is unknown, ask — don't invent it.
4. **Write the typed API client function** in `lib/api/<module>.ts`
   before writing any UI.
5. **Write the React Query hook** in `lib/hooks/` wrapping that function.
6. **Build the UI**: Server Component for initial fetch, Client Component
   for interactivity, following code-quality.mdc.
7. **Wire error handling** per error-handling.mdc — every mutation needs a
   visible failure state.
8. **Self-check before calling it done:**
   - Does this need a permission check? If yes, stop and switch to
     implement-admin-feature or apply security-data-access.mdc directly.
   - Are there tests for the new `lib/api` function and any new
     `lib/permissions` logic?
   - Does it match the PRD's stated scope, or did it quietly add something
     from "Explicitly deferred" (docs/MVP_ROADMAP.md)? If so, flag it.
9. Offer to run `@progress-log` to record what shipped.
