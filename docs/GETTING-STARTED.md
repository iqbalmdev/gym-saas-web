# Getting started — clear path

How to use this repo day-to-day (humans + Cursor agents).

## 1. Open the project

Local path: `/Users/iqbal/Projects/gym-saas-web`

## 2. Connect MCPs (once)

**Cursor Settings → Tools & MCP** — enable and login:

1. **Postman** — so the agent can run the Gym Backend collection  
2. **Context7** — live Next.js / Zod / Playwright docs  
3. GitHub, Supabase (dev only), Vercel, Playwright  

Details: `docs/mcp-setup.md`

## 3. Postman collection (cloud SSOT)

Working copy lives in **Postman cloud** (not in this git repo). Sync when backend updates GitHub:

> Use skill **sync-postman-collection**. Pull from abdulhasibn/gym-backend-postman with GitHub MCP and inject into my Postman workspace (no local postman/ JSON).

Details + workspace IDs: `docs/postman-sync.md`  
Auth contract: `docs/api/client-auth.md`  
Prod API: `https://gym-backend-lovat-mu.vercel.app` (`GET /health` → ok)

## 4. Start any coding task

```bash
npm install
npm run dev
```

Open http://localhost:3000 → redirects to `/login`. Admin chrome stubs at `/admin`.

In chat:

> Use **orient**. We’re building \<slice\>. Follow architecture-plan and verify-api-flow for API.

Agent will read `PROGRESS` + architecture plan, then implement via ports/adapters.

## 5. Test a backend feature before UI

> Use **verify-api-flow** with Postman MCP. STAFF lane. Request OTP → verify → `/auth/me` → endpoint X.

## 6. Large features

`/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` + `/tdd` → `/code-review`

UI E2E: `npm run test:e2e` (installs Chromium if needed, builds, Playwright on :3001). First run may download a browser. Unit: `npm test` (Vitest).

**Rules & skills how-to:** root [`README.md`](../README.md).

## 7. Product truth

- Showcase: https://prd-showcase.vercel.app/  
- PRD: `docs/PRD.md`  
- Flows: `docs/product-flows.md`  
- Glossary: `docs/CONTEXT.md`

## Do not

- Invent payment gateway / WhatsApp / open join codes  
- Put `fetch` or entitlement math in JSX (use ports/adapters)  
- Use production Supabase via MCP for experiments  
- Skip updating `docs/PROGRESS.md` after a meaningful chunk
