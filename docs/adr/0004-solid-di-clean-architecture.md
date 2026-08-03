# ADR 0004 — SOLID + DI/DIP (Clean Architecture for React web)

## Status

Accepted

## Context

We need maintainable Next.js code as Admin (then Trainer/Client) features grow. Cargo-cult “enterprise” folders fight delivery speed; dumping fetch + domain math in JSX creates untestable mush. [Alex Kondov’s Clean Architecture in React](https://alexkondov.com/full-stack-tao-clean-architecture-react/) shows a pragmatic middle path: layers, deep modules, transport vs presentation, without forcing full backend-style hexagonal ceremony on every screen.

## Decision

Adopt **SOLID**, **dependency inversion**, and **lightweight dependency injection** for this web repo as documented in `docs/architecture-plan.md` §4 (Clean Architecture) and `.cursor/rules/code-quality.mdc`.

Concrete rules:

1. Presentation components are as close as practical to **pure render** (props in → markup out).
2. Orchestration lives in **application use-cases / hooks** that depend on **ports** (TypeScript interfaces).
3. HTTP lives in **adapters** (`lib/api/*`) implementing those ports; endpoints/query keys are named constants.
4. Display formatting and entitlement *presentation* mapping live in `lib/display` or use-cases — **not** JSX.
5. Domain entitlement *authority* remains on **S3 API**; web never re-implements “unpaid locks check-in”.
6. Wire real adapters at a **composition root** (route/server module or factory). Tests inject fakes.
7. Prefer **deep modules**; delete shallow wrappers. Stay pragmatic — start simple, extract before ship.

## Consequences

- Scaffold must introduce `lib/ports` (or feature-local ports) + `lib/api` adapters early.
- Agents must refuse entitlement logic and transport details inside JSX when reviewing/implementing.
- Slightly more files per feature; much easier Playwright/unit testing and API swaps.
