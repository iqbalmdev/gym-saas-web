---
name: orient
description: Use at the start of a new session, or before picking up any task, to re-establish where the Gym SaaS build actually stands versus the PRD orbit (Foundation -> Stint 1.1-1.4 -> 1.5 subscriptions Admin -> ...). Also use when the user asks "what's next" or "where are we."
---

# Orient

Before touching any code, build an accurate picture of current state. Do
not assume the PRD's target state is the current state — verify.

## Steps

1. Read `docs/PROGRESS_LOG.md` (if it exists) for the most recent entries.
2. Read `docs/PRD.md`, `docs/permissions.md`, `docs/MVP_ROADMAP.md` for
   target scope. Note the module currently marked "Foundation" / "shipped"
   in the orbit vs. what's actually next.
3. Grep the repo for the module boundaries in `app/(admin)/` to see which
   of M1–M13 actually have routes/components already.
4. Check `lib/permissions/` for which role/tenant/grant checks already
   exist — don't assume auth is wired up just because routes exist.
5. Run `git log --oneline -20` to see recent work; cross-check against
   git-conventions.mdc scope tags (m1..m13) to map commits to modules.
6. Summarize back to the user in this shape before doing anything else:
   - What's actually shipped (verified in code, not just claimed)
   - What's stubbed/UI-only
   - The single most logical next task, with the module id
   - Any drift between docs/PRD and what the code actually does — flag it,
     don't silently resolve it

Do not start implementing anything during this skill — it's read-only
reconnaissance. Hand off the summary and wait for the user's go-ahead.
