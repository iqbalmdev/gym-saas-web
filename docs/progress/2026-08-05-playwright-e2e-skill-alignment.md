# 2026-08-05 — Playwright E2E skill alignment

- POM fixtures (`e2e/fixtures/pages.fixture.ts`); specs inject pages (no `new` in specs).
- Login coverage: lane-first, disabled states, OTP Staff→create-gym / Client→/client.
- `reuseExistingServer: false` so E2E always uses fixture-enabled `next start`.
- Fix: Admin/onboarding layouts rethrow `redirect()` errors (catch was swallowing create-gym gate).
