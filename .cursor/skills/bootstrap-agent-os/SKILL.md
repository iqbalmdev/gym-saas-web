---
name: bootstrap-agent-os
description: Scaffold a lean Agent OS (PROGRESS, few rules/skills, MCP) on a new empty repo. Prefer short rules with globs over docs sprawl.
---

# Bootstrap Agent OS

Lean OS only — not a docs dump. Model after gym-saas-web: short `.mdc` rules, few skills, one `PROGRESS.md`.

## Confirm

1. Project path  
2. One-paragraph product  
3. Stack (e.g. Next.js App Router)  
4. MCP list (Context7 + domain tools)

## Create

1. `docs/PROGRESS.md`, `docs/README.md` (index), thin `AGENTS.md`
2. Product spine stubs: PRD / CONTEXT / architecture-plan (short)
3. `.cursor/rules/` — **one screen each**, globs when possible:
   - `progress-log`, `git-conventions`, `code-quality` (always)
   - `architecture`, `nextjs-app-router`, `state-management`, `testing`, `error-handling` (globs)
4. `.cursor/skills/` — `orient`, `implement-feature` first (state tier in implement-feature)
5. `.cursor/mcp.json` stubs

## Next.js web defaults to encode

- Server Components fetch; Server Actions mutate; ports/adapters for HTTP
- State: server owns API data; `useState` for forms; URL for filters; Zustand only for shared client UI chrome

## Do not

- Copy research folders, playbooks, or long agent guides by default
- Vendor Postman JSON into app repos
- Scaffold full features until OS exists (unless user demands code first)
- Mandate Redux or global client stores for server data
