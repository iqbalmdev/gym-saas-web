# 2026-08-04 — Test scaffold (Vitest + Playwright)

- Unit seams: theme preference, session model encode/decode, auth error display (`npm test`).
- E2E: login gate, theme toggle, collapsible Admin sidebar with STAFF cookie fixture (`npm run test:e2e`); POM under `e2e/pages/`.
- Documented runners in `docs/architecture.md`. Playwright pinned ~1.48 for macOS 13 arm64.
