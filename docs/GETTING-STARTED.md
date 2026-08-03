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

## 3. Import Postman (optional desktop)

1. Open Postman → Import  
2. Files under `postman/`:
   - `Gym-Backend-API.postman_collection.json`
   - `Gym-Backend-Dev.postman_environment.json` (or Local)
3. Select **Gym Backend — dev**, set `email`, run OTP flow from `docs/api/client-auth.md`

Upstream updates: https://github.com/abdulhasibn/gym-backend-postman

## 4. Start any coding task

In chat:

> Use **orient**. We’re building \<slice\>. Follow architecture-plan and verify-api-flow for API.

Agent will read `PROGRESS` + architecture plan, then implement via ports/adapters.

## 5. Test a backend feature before UI

> Use **verify-api-flow** with Postman MCP. STAFF lane. Request OTP → verify → `/auth/me` → endpoint X.

## 6. Large features

`/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` + `/tdd` → `/code-review`

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
