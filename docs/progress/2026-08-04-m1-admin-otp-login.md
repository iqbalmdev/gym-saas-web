# 2026-08-04 — M1 Admin OTP login

- `/login`: email → OTP verify; STAFF lane hard-coded; product copy (no architecture jargon).
- Server Actions → `createAppServices()` ports; httpOnly session cookie (ADR-0005).
- `/admin` guarded; shows `roleCode` / `staffCode`; sign out; STAFF_UNASSIGNED nudge to Settings.
- Build green.
