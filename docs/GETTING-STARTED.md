# Getting started

## 1. Open workspace

**File → Open Workspace from File…** → `gym-saas.code-workspace`  
(web + sibling `gym-backend-postman`)

Sibling once:  
`git clone https://github.com/abdulhasibn/gym-backend-postman.git` → `../gym-backend-postman`

## 2. MCP (once)

Cursor **Settings → Tools & MCP**: Postman, Context7, GitHub, Playwright (+ Supabase/Vercel if needed).  
Details: `docs/mcp-setup.md`

## 3. Run the app

```bash
npm install
npm run dev
```

http://localhost:3000 → `/login`. Unit: `npm test`. E2E: `npm run test:e2e`.

## 4. Agent prompts

```
Use orient. We’re building <slice>.
```

```
Use sync-postman-collection. Pull sibling, inject Postman cloud.
```

```
Use verify-api-flow. STAFF OTP → endpoint X.
```

Docs SSOT: `docs/README.md`. Stage: `docs/PROGRESS.md`.
