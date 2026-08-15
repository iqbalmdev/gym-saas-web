# 2026-08-04 — Next.js Clean Architecture scaffold

- Next.js 16 App Router + Tailwind 4 + Zod; `npm run build` green.
- Layers: `lib/ports` (AuthGateway, GymOrgs*), `lib/api` (client, adapters, `createAppServices` DI root), `lib/features/*` use-cases, `lib/display`, `lib/theme/crm-light.css`.
- Routes: `/login`, `/admin/*` stubs, reserved `/trainer` + `/client`.
- Session storage still open (A2) — stub in `lib/auth/session.ts`.
