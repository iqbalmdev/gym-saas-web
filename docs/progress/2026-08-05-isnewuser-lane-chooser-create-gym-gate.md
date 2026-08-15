# 2026-08-05 — isNewUser lane chooser + create-gym gate

- Auth adapter/ports: Request OTP returns `isNewUser`; verify `lane` optional for returning users.
- Login steps: lane → email → OTP; post-auth via `resolvePostAuthPath`.
- `/onboarding/create-gym` + Admin redirect when `gymOrgs` empty; `/client` for CLIENT lane.
- Root `README.md` (rules/skills); research `docs/research/2026-08-05-auth-isnewuser-lane-gym-gate.md`.
- Tests: unit path/schema; E2E fixtures (`GYM_SAAS_E2E_FIXTURES`) for SSR gym gate + OTP; lane step, empty-gym redirect, client home.
