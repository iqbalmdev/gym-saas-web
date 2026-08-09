---
name: playwright-e2e-testing
description: Use when adding or updating a Playwright end-to-end test for the Web Admin app, or when the user asks to test a full user-facing flow (invite a member, mark attendance, process a renewal) through the actual UI rather than unit-level.
---

# Playwright E2E testing

E2E tests cover real Admin workflows through the UI — complementary to,
not a replacement for, the permission unit tests in testing.mdc.

## Steps

1. Identify the flow in PRD terms (e.g. "M3 Members: Admin sends invite,
   client accepts on a test account, Admin sees them in roster").
2. Place the spec under `e2e/<module>/<flow-name>.spec.ts`, one flow per
   file, named after the module.
3. Use role-based test fixtures/seeded accounts for CLIENT, TRAINER,
   ADMIN, UNASSIGNED — never hardcode a "God mode" account that skips
   permission checks; tests should exercise the real auth stack.
4. Assert on user-visible outcomes (text, visible rows, redirect), not
   internal state or CSS class names.
5. For any flow gated by role/tenant/grant, include at least one negative
   test in the same file: e.g. a TRAINER without a PROGRESS grant should
   NOT see progress data in the UI. This mirrors the security-data-access
   checks but from the UI's perspective.
6. Keep tests independent — no test should depend on state left behind by
   a previous test file; use fresh seeded data per spec.
7. After writing the test, actually run it (`npx playwright test`) rather
   than assuming it passes — report the real result.
