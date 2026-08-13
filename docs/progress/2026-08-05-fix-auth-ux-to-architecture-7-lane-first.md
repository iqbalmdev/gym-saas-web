# 2026-08-05 — Fix auth UX to architecture §7 (lane first)

- Login: lane → email → OTP (removed email-first + “Check your email” continue).
- Verify still sends `lane` only when API `isNewUser` is true.
- ThemeToggle: mount-safe to stop hydration mismatch on `/login`.
- Admin layout: empty gym list → create-gym; list/network errors no longer bounce to onboarding (create loop).
- Documented flow in `docs/architecture.md` + plan §7.
