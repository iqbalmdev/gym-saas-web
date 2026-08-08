# AI Development Playbook

How this Gym SaaS web repo was set up for **agent-assisted development**, how to **clone the same OS onto a brand-new project**, and how tools like **Context7** fit in.

**Audience:** you + Cursor agents  
**Companion:** `docs/architecture-plan.md`, `AGENTS.md`, `.cursor/rules/*`, `.cursor/skills/*`

---

## 1. What we built (the “Agent OS”)

Think in four layers. Agents fail when one layer is missing.

| Layer | What it is | Where in this repo |
|---|---|---|
| **Docs (memory)** | Product + architecture truth; stage of work | `docs/PRD.md`, `product-flows.md`, `CONTEXT.md`, `architecture-plan.md`, `PROGRESS.md`, `adr/` |
| **Rules (laws)** | Always-on / file-scoped constraints | `.cursor/rules/*.mdc` |
| **Skills (playbooks)** | Step-by-step workflows when a task type starts | `.cursor/skills/*`, `.agents/skills/*` (Matt Pocock) |
| **MCPs (hands)** | Talk to GitHub, Supabase, Postman, Vercel, Playwright, **Context7** | `.cursor/mcp.json` |

Without docs, the agent invents product. Without rules, it invents style and breaks tenancy/grants. Without skills, it skips orient/TDD. Without MCPs, it guesses APIs and library APIs from stale training data.

---

## 2. Steps we actually followed (ordered)

Use this as the checklist for **any** new project.

### Phase 0 — Decide product spine

1. Lock buyer, surfaces, stack (here: Admin-first Next.js web → Express/Supabase API).
2. Import or write **PRD** + **product flows** + glossary (**CONTEXT**).
3. Do **not** start UI until Agent OS exists (ADR-0001).

### Phase 1 — Create repo + GitHub

1. Create local folder + `git init`.
2. Private GitHub remote; push early.
3. `.gitignore` for `.env`, `node_modules`, secrets.

### Phase 2 — Progress log (stage truth)

1. Add `docs/PROGRESS.md` with **Current stage**, **Next up**, **Log** (newest first).
2. Add always-apply rule `progress-log.mdc`: read stage before work; write after chunks.
3. Agents must prefer PROGRESS over guessing from git history.

### Phase 3 — Architecture plan (build contract)

1. Write `docs/architecture-plan.md`: system context, layers, folders, module→routes, auth/tenancy, out-of-scope.
2. Accept via ADR; keep a short `architecture.md` pointer.
3. Add SOLID / DI / DIP / Clean Architecture (ports → adapters → presentation) — ADR-0004 + `code-quality.mdc`.
4. Wire architecture into always-apply `architecture.mdc`.

### Phase 4 — Domain & safety rules

1. Glossary (`CONTEXT.md`) — ubiquitous language.
2. Security / tenancy / grants rules (here: DataGrants).
3. Error-handling, testing, git conventions, UI theme (tokens, swappable).
4. Framework rule (here: `nextjs-app-router.mdc` with globs).

### Phase 5 — Project skills

| Skill | Job |
|---|---|
| `orient` | Read PROGRESS + architecture plan sections + narrow product docs |
| `implement-feature` | One vertical slice; ports/adapters; checklist |
| Persona alias (optional) | e.g. `implement-admin-feature` |
| `verify-api-flow` | OTP → tokens → endpoint (Postman/env vars) |
| `bootstrap-agent-os` | **Recreate this whole OS on a new repo** |

### Phase 6 — Matt Pocock engineering skills

1. Ensure Node (nvm).
2. `npx skills@latest add mattpocock/skills --agent cursor … -y`
3. Configure `docs/agents/` (issue tracker, triage labels, domain docs) + `AGENTS.md`.
4. Use `/grill-with-docs`, `/to-spec`, `/to-tickets`, `/implement`, `/tdd`, `/code-review`.

### Phase 7 — MCP arms

1. Project `.cursor/mcp.json`: Supabase, Postman, GitHub, Vercel, Playwright, **Context7**.
2. User completes OAuth / API keys in **Cursor Settings → Tools & MCP**.
3. Document in `docs/mcp-setup.md`.

### Phase 8 — Only then scaffold app code

1. Next.js App Router per architecture plan folders.
2. `lib/ports`, `lib/api` adapters, `lib/features` use-cases first.
3. Feature slices in PRD order; update PROGRESS every chunk.

---

## 3. Rules used here (and why)

| Rule file | Why |
|---|---|
| `progress-log.mdc` | Stops “agent invents what exists” |
| `architecture.mdc` | Multi-persona, Admin-first, plan is law |
| `code-quality.mdc` | SOLID, DI/DIP, Kondov Clean Architecture |
| `security-data-grants.mdc` | Privacy / entitlements UI rules |
| `error-handling.mdc` | Calm UX; no stack dumps |
| `nextjs-app-router.mdc` | Server Components, route groups |
| `ui-theme.mdc` | Token theme; changeable later |
| `testing.mdc` | Vertical-slice / entitlement edges |
| `git-conventions.mdc` | Small commits; no secret commits |

**Pattern:** one concern per rule; under ~50–80 lines; actionable; `alwaysApply` only for true globals.

---

## 4. End-to-end feature loop (AI way)

```text
orient
  → architecture-plan (§ relevant) + PROGRESS
  → Context7 (library docs if touching Next/Zod/Playwright/…)
  → /grill-with-docs if ambiguous
  → /to-spec → /to-tickets
  → implement-feature + /tdd (ports → adapters → UI)
  → verify-api-flow / Postman MCP
  → Playwright MCP smoke
  → /code-review (Standards + Spec)
  → update PROGRESS.md
```

That loop is how “AI development” stays engineering instead of vibe coding.

---

## 5. Extra coding patterns that work well with agents

These complement SOLID/DI already in the plan.

### 5.1 Tracer-bullet slices

Ship one thin path end-to-end (API type → adapter → use-case → empty UI → happy path) before filling edge cases. Agents overbuild when the ticket is “build CRM”.

### 5.2 Interface-first / access-pattern first (Kondov)

Design the screen’s data needs and port methods before polishing JSX. Ask: what does Admin need to *do*? Encode that as `RenewalsReader.listDueWithinDays`.

### 5.3 Deep modules

Export a small API (`listRenewalsForInbox`) that hides caching, mapping, and errors. Avoid shallow `utils.ts` dumping grounds.

### 5.4 Composition root

Only route/server entry wires `HttpRenewalsAdapter` into the use-case. Features import ports/types, not axios.

### 5.5 Schema at the boundary

Parse API JSON with Zod (or equivalent) in adapters. Types alone lie; agents love unsafe casts — forbid them in rules.

### 5.6 Display mappers

Relative dates, payment badges, grant empty copy live in `lib/display` — never dayjs/entitlement math in JSX.

### 5.7 Explicit states

Every list screen: `loading | empty | forbidden/grant-missing | error | ready`. Agents skip these unless rules demand them.

### 5.8 Glossary-driven naming

If CONTEXT says DataGrant, code must say DataGrant — agents otherwise invent `sharePermission`.

### 5.9 Dual review axis (Matt `/code-review`)

- **Standards:** SOLID, rules, smells  
- **Spec:** PRD + architecture plan + ticket  

### 5.10 Context7 before framework APIs

When using Next.js App Router, Zod, Playwright, Supabase JS, Tailwind, etc., **query Context7** for current docs instead of memory. See §6.

### 5.11 Handoff discipline

Long threads → `/handoff` or update PROGRESS so the next session doesn’t re-discover stage.

### 5.12 Secured tool use

MCP tool calls need approval; never paste production secrets into chat; Supabase MCP on **dev** only.

---

## 6. Context7 — what it is and why it helps *this* project

Site: [context7.com](https://context7.com/)

### What it does

Context7 is an MCP that gives the agent **up-to-date, versioned library documentation** on demand (Next.js, React, Zod, Playwright, Supabase client, Tailwind, Vitest, etc.). Training data goes stale; Context7 pulls current docs into the agent’s context when coding.

### How it is wired here

In `.cursor/mcp.json`:

```json
"context7": {
  "url": "https://mcp.context7.com/mcp"
}
```

Optional: add `CONTEXT7_API_KEY` header from [context7.com/dashboard](https://context7.com/dashboard) for higher limits. Enable in **Cursor Settings → Tools & MCP**, then restart if needed.

### How agents should use it (examples for Gym Admin web)

| Task | Context7 query | Benefit |
|---|---|---|
| Scaffold App Router layouts / Server Actions | Next.js current docs | Correct `app/` APIs, not outdated `pages/` advice |
| Adapter schema validation | Zod docs | Correct `z.object` / transforms for DTO parsing |
| E2E smoke | Playwright docs | Current locators, fixtures, config |
| Session cookies in Next | Next.js cookies/headers docs | Safer auth composition root |
| Deploy | Vercel + Next docs | Avoid deprecated config keys |
| Later Supabase JS from web (if ever) | `@supabase/supabase-js` docs | Correct client init — still prefer API for domain |

### Benefits specifically for our way of working

1. **Architecture plan stays stable; libraries move.** Ports/adapters don’t change meaning when Next ships a new API — Context7 updates *how* the adapter is written.
2. **Fewer hallucinated APIs.** Agents invent non-existent Next.js or Zod helpers; Context7 reduces that.
3. **Faster onboarding of new stacks** (e.g. when Phase B adds a chart lib): query Context7 → implement behind a port.
4. **Pairs with verify skills.** Postman checks *our* API; Context7 checks *framework* correctness.
5. **Team consistency.** Everyone’s agent reads the same live docs instead of different model cutoffs.

### What Context7 is *not*

- Not a replacement for `PRD` / `CONTEXT` / architecture plan (product truth).
- Not a replacement for Supabase MCP (project data) or Postman (your API collection).
- Not permission to skip SOLID — still ports → adapters → UI.

### Rule of thumb for prompts

> “Before writing Next/Zod/Playwright code, use Context7 to pull current docs for X, then implement against our architecture-plan ports.”

---

## 7. Replicating this on a **brand-new** project

### Option A — Run the bootstrap skill (preferred)

In the new empty (or nearly empty) repo, ask the agent:

> Run **bootstrap-agent-os**. Product: \<one paragraph\>. Stack: \<e.g. Next.js + …\>. Personas: \<…\>.

The skill (`.cursor/skills/bootstrap-agent-os/SKILL.md`) walks the same phases as §2 and creates the file tree.

### Option B — Manual copy

1. Copy `.cursor/rules` + adapt names (replace DataGrants with your security model).
2. Copy skills: `orient`, `implement-feature`, `verify-api-flow`, `bootstrap-agent-os`.
3. Copy playbook + architecture-plan template structure; rewrite domain sections.
4. `npx skills add mattpocock/skills` + `/setup-matt-pocock-skills`.
5. Copy `mcp.json`; keep Context7 + GitHub; swap Supabase/Postman/Vercel as needed.
6. Write PROGRESS day one.

### What must be rewritten per product

- PRD / flows / CONTEXT glossary  
- Architecture plan module map  
- Security rule (grants vs RLS vs roles)  
- Theme direction  
- `verify-api-flow` endpoints  

What usually stays: progress-log, code-quality (SOLID/DI), orient loop, Matt skills, Context7, GitHub MCP.

---

## 8. Definition of done for “Agent OS ready”

- [ ] `PROGRESS.md` with Current stage / Next up / Log  
- [ ] Architecture plan + at least one ADR accepting it  
- [ ] CONTEXT glossary  
- [ ] Core rules (progress, architecture, code-quality, errors, git)  
- [ ] `orient` + `implement-feature` skills  
- [ ] Matt Pocock skills + `docs/agents/*`  
- [ ] MCP including Context7; login verified  
- [ ] README / AGENTS.md pointing at the loop  
- [ ] **No** large feature code until the above exists (unless emergency hotfix)

---

## 9. References

- This repo architecture: `docs/architecture-plan.md`  
- Clean Architecture in React: https://alexkondov.com/full-stack-tao-clean-architecture-react/  
- Matt Pocock skills: https://github.com/mattpocock/skills  
- Context7: https://context7.com/  
- MCP setup: `docs/mcp-setup.md`
