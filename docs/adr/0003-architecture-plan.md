# ADR 0003 — Accept web architecture plan as build contract

## Status

Accepted

## Context

Agent OS, product PRD, and a short `architecture.md` existed, but there was no single **architecture plan** mapping system context → layers → folders → module routes → auth/tenancy → agent workflow. Without it, scaffolding and features risk drifting from PRD surfaces (S2 web vs S3 API) and Admin-only dead-ends.

## Decision

- Adopt `docs/architecture-plan.md` as the **build contract** for this Next.js repo.
- Keep `docs/architecture.md` as the short orientation summary that points at the plan.
- Agents must read the relevant plan sections during `orient` / `implement-feature` and treat deviations as ADR-worthy.
- Scaffold and features must follow Phase A Admin routes and reserved persona groups in the plan.

## Consequences

- Implementation order and folder layout are constrained (good for agents).
- Session mechanism (cookie vs other) remains an open item in the plan until M1 lands with its own ADR detail if needed.
- Future Trainer/Client web must extend the plan via ADR amendments, not silent forks.
