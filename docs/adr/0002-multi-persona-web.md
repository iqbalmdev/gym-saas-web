# ADR 0002 — Multi-persona web, Admin-first delivery

## Status

Accepted

## Context

The repo was bootstrapped with an Admin-focused name and skills. The PRD defines three personas (Client, Trainer, Admin) across mobile and web. Building as forever-Admin-only would force a rewrite when Trainer/Client web starts.

## Decision

- Treat this repository as **Gym SaaS Next.js web** for all web personas.
- **Deliver Admin first** (current wedge).
- Keep architecture, route groups, shared `lib/*`, and skills **persona-ready** (`implement-feature` + Admin alias).
- Do not create a separate Next app per persona unless a future ADR requires it.

## Consequences

- Folder/repo name `gym-admin-web` may remain; docs and rules clarify multi-persona intent.
- Agents must not encode Admin-only globals that block `(trainer)` / `(client)` route groups.
- Progress and Next up stay Admin-sequenced until Phase B is explicitly started.
