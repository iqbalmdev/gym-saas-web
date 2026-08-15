# 2026-08-04 — Light / dark theme

- Token maps in `lib/theme/crm-tokens.css` via `html[data-theme]`; FOUC-safe boot script + `ThemeProvider` / `ThemeToggle`.
- Preference in `localStorage` (`gym-saas-theme`); first visit follows system. Toggle in Admin header, drawer, and login.
