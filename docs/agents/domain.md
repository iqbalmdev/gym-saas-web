# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root (symlink to `docs/CONTEXT.md`) — glossary / ubiquitous language.
- **`docs/PROGRESS.md`** — Current stage and Next up (project-specific; prefer over inventing stage).
- **`docs/architecture-plan.md`** — build contract (layers, folders, module routes, auth/tenancy). Required for scaffold/feature work.
- **`docs/architecture.md`** — short summary pointing at the plan.
- **`docs/adr/`** — ADRs that touch the area you're about to work in.
- **`docs/PRD.md`** / **`docs/product-flows.md`** — product behavior when the task is feature work (read narrowly).

If a file doesn't exist, **proceed silently**. Domain modeling skills create glossary/ADR content lazily when terms are resolved.

## File structure

Single-context Gym SaaS web repo:

```
/
├── CONTEXT.md          → docs/CONTEXT.md
├── docs/
│   ├── CONTEXT.md
│   ├── PROGRESS.md
│   ├── PRD.md
│   ├── product-flows.md
│   ├── architecture-plan.md  ← build contract
│   ├── architecture.md       ← short summary
│   ├── agents/         ← issue tracker + triage + this file
│   └── adr/
├── .agents/skills/     ← Matt Pocock skills
└── .cursor/skills/     ← project-specific skills (orient, etc.)
```

## Use the glossary's vocabulary

When your output names a domain concept, use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding.
