---
name: bootstrap-agent-os
description: Scaffold the full AI Agent OS (docs, rules, skills, MCP, progress log, architecture plan stubs) on a brand-new or empty repo. Use when starting a new project or when the user asks to replicate the gym-admin-web agent setup elsewhere.
---

# Bootstrap Agent OS

Recreate the same agent-development operating system used in Gym SaaS web. Follow `docs/ai-development-playbook.md` phases. **Do not** scaffold full application features until the OS exists (unless the user explicitly demands code first).

## Preconditions

Ask (or infer from user message) and confirm:

1. **Project path** (create folder if missing; `move_agent_to_root` if creating new)
2. **One-paragraph product** (buyer, personas, wedge)
3. **Stack** (e.g. Next.js App Router + typed API client)
4. **Issue tracker** (default GitHub)
5. **MCP list** (default: GitHub, Context7, plus domain-relevant: Supabase, Postman, Vercel, Playwright)

## Steps (execute in order)

### 1. Repo skeleton

- `git init` if needed; `.gitignore` (env, node_modules, `.next`, secrets)
- `README.md` pointing at Agent OS + playbook
- `AGENTS.md` with Agent skills section stubs
- `docs/PROGRESS.md` — Current stage = “Agent OS bootstrap”; Next up = architecture + first scaffold
- `docs/adr/0001-agent-os-first.md` — Agent OS before features

### 2. Product spine (stubs OK)

Create or copy:

- `docs/PRD.md` or `docs/PRODUCT.md` (user content)
- `docs/product-flows.md` (or journeys stub)
- `docs/CONTEXT.md` glossary (start with 5–10 terms)
- Symlink or root `CONTEXT.md` → `docs/CONTEXT.md` if Matt skills will be used

### 3. Architecture plan

- `docs/architecture-plan.md` from playbook structure: system context, layers with **ports/adapters/SOLID/DI**, folder map, module routes, auth, out-of-scope
- `docs/architecture.md` short pointer
- ADR accepting the plan
- ADR for SOLID/DI if applicable

### 4. Cursor rules (`.cursor/rules/`)

Always create:

- `progress-log.mdc` (`alwaysApply: true`)
- `architecture.mdc` (`alwaysApply: true`) — points at architecture-plan
- `code-quality.mdc` (`alwaysApply: true`) — SOLID, DI/DIP, deep modules, no fetch in JSX
- `error-handling.mdc`
- `git-conventions.mdc`
- `testing.mdc`

Add product-specific:

- Security/tenancy rule
- Framework rule with `globs` (e.g. Next.js)
- UI theme rule (tokens; swappable)

### 5. Project skills (`.cursor/skills/`)

- `orient` — PROGRESS + architecture-plan sections + narrow docs; mention Context7 for libs
- `implement-feature` — vertical slice; ports/adapters; checklist
- `verify-api-flow` — if HTTP API exists
- Copy this `bootstrap-agent-os` skill into the new repo too

### 6. Matt Pocock skills (optional but recommended)

```bash
# with nvm/node available
npx skills@latest add mattpocock/skills --agent cursor \
  --skill setup-matt-pocock-skills --skill ask-matt --skill grill-with-docs \
  --skill to-spec --skill to-tickets --skill implement --skill tdd \
  --skill code-review --skill diagnosing-bugs --skill domain-modeling \
  --skill grilling --skill grill-me --skill wayfinder --skill triage -y
```

Then write `docs/agents/issue-tracker.md`, `triage-labels.md`, `domain.md` (GitHub defaults unless user says otherwise).

### 7. MCP (`.cursor/mcp.json`)

Minimum:

```json
{
  "mcpServers": {
    "context7": { "url": "https://mcp.context7.com/mcp" },
    "github": { "url": "https://api.githubcopilot.com/mcp/" }
  }
}
```

Add Postman / Supabase / Vercel / Playwright as relevant. Write `docs/mcp-setup.md` with OAuth instructions. Tell user to enable servers in Cursor Settings.

### 8. Playbook copy

- Copy or adapt `docs/ai-development-playbook.md` into the new repo (replace Gym-specific examples).

### 9. Progress update

- Mark Agent OS done in `PROGRESS.md`; Next up = first scaffold per architecture plan.
- Commit only if the user asked.

## Done checklist

- [ ] PROGRESS + architecture-plan + CONTEXT exist
- [ ] Core rules + orient + implement-feature exist
- [ ] MCP includes Context7; setup doc lists login steps
- [ ] AGENTS.md / README explain the feature loop
- [ ] User told: complete MCP logins; then scaffold app code

## Anti-patterns

- Scaffolding a giant UI before PROGRESS/architecture
- Copying Gym DataGrant rules into an unrelated product unchanged
- Installing 40 unused Matt skills without setup-matt-pocock-skills
- Hardcoding API keys into `mcp.json` (use env / OAuth)
