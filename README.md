# Gym SaaS Web

Admin-first Next.js app for Gym SaaS (Trainer/Client web later in the same repo).

**Run the app / tests:** see [`docs/GETTING-STARTED.md`](docs/GETTING-STARTED.md).  
**What stage we are in:** see [`docs/PROGRESS.md`](docs/PROGRESS.md).

---

## How to use rules and skills (agents + humans)

This repo is set up so Cursor agents follow a small Agent OS. Use it on purpose — do not improvise past it.

### 1. Orient first

Before any non-trivial feature, bug, or refactor:

1. Open / invoke skill **`orient`** (`.cursor/skills/orient`)
2. Read **Current stage** and **Next up** in [`docs/PROGRESS.md`](docs/PROGRESS.md)
3. Read only the architecture/product sections that apply (see orient skill table)

Do not guess which features exist from git history alone.

### 2. Rules (always-on constraints)

Live in [`.cursor/rules/`](.cursor/rules/). They constrain *how* work is done:

| Rule | Forces |
|---|---|
| `architecture.mdc` | Admin-first, shared `lib/*`, route groups; out-of-MVP list |
| `security-data-grants.mdc` | Gym-owned vs Client-owned; missing grant = calm empty state |
| `code-quality.mdc` | Strict TS; UI vs API vs display mappers |
| `error-handling.mdc` | Calm copy; no stack traces in UI |
| `testing.mdc` | Vitest seams + Playwright E2E skill; no CSS-class asserts |
| `progress-log.mdc` | Update `docs/PROGRESS.md` after meaningful chunks |
| `git-conventions.mdc` | Commit only when asked |
| `ui-theme.mdc` / tokens | CRM-light tokens; no purple AI defaults |
| `postman-sync.mdc` | Postman cloud SSOT; no vendored `postman/*.json` |

If a rule conflicts with a one-off request, follow the rule unless the human explicitly overrides it.

### 3. Project skills (`.cursor/skills`)

Invoke these by name when the task matches:

| Skill | Use when |
|---|---|
| **orient** | Start of non-trivial work |
| **implement-feature** | Building a vertical slice (any persona) |
| **implement-admin-feature** | Admin-only alias of implement-feature |
| **verify-api-flow** | Live OTP / Bearer smoke against Gym Backend |
| **sync-postman-collection** | Pull GitHub Postman publish → Postman cloud |
| **playwright-e2e-testing** | Author/run browser E2E (`e2e/`, POM) |
| **bootstrap-agent-os** | Recreate Agent OS on another new project |

Full index: [`AGENTS.md`](AGENTS.md).

### 4. Matt Pocock skills (`.agents/skills`)

Use for methodology (grill, TDD, code-review, research, triage, …). Common entry points are listed in `AGENTS.md` (`/ask-matt`, `/grill-with-docs`, `/implement`, `/tdd`, …).

**research** skill: investigate against primary sources and write a note under `docs/research/`.

### 5. Simple recipes

**New Admin UI slice**

```
orient → implement-feature (or implement-admin-feature)
→ npm test / npm run test:e2e as needed
→ update docs/PROGRESS.md
```

**Auth or API contract change**

```
sync-postman-collection (if collection moved)
→ update docs/api/client-auth.md
→ verify-api-flow smoke
→ implement-feature for web changes
```

**Bug in the browser**

```
orient → diagnosing-bugs (Matt) or Playwright MCP explore
→ fix + unit/E2E at public seams
```

### 6. Domain language

Reuse glossary terms from [`docs/CONTEXT.md`](docs/CONTEXT.md) (GymOrg, DataGrant, Lead, lane, …). Product behavior: [`docs/PRD.md`](docs/PRD.md) + [`docs/product-flows.md`](docs/product-flows.md). Build contract: [`docs/architecture-plan.md`](docs/architecture-plan.md).

---

## Commands (quick)

```bash
npm run dev          # http://localhost:3000
npm test             # Vitest
npm run test:e2e     # install Chromium if needed + build + Playwright on :3001
npm run build
```
