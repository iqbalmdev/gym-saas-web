# Architecture — Gym SaaS Web (Next.js)

**Full plan (build contract):** [`docs/architecture-plan.md`](architecture-plan.md) — **read this before scaffolding or implementing features.**

Status: Summary only. Do not invent a different stack without an ADR. Acceptance: ADR-0003.

## Product surfaces (PRD)

| Surface | Stack | Personas | This repo? |
|---|---|---|---|
| **S2 Web** | Next.js (App Router) + TypeScript | **Admin now**; **Client** and **Trainer** web later | **Yes** |
| S1 Mobile | React Native | Client + Trainer (+ light Admin) | No |
| S3 API & data | Express + Supabase | All | No (HTTP client only) |

This repo is **multi-persona web**, Admin-first (ADR-0002). Shared `lib/api`, `lib/auth`, `lib/theme`; route groups `(admin)` / `(trainer)` / `(client)`.

## Phases

- **Phase A — Admin:** renewals inbox, CRM, desk, roster, plan catalog (see plan §6 delivery order).
- **Phase B — Trainer / Client web:** same app, grant-aware; no second Next app without ADR.

## Layers (one-liner)

Presentation → application (ports) → adapters (`lib/api`) → S3 API. SOLID + DI/DIP (ADR-0004). Entitlements/DataGrants enforced by API; UI shows calm empty states when grants are missing. See plan §4.

## Agent rule

Before non-trivial work: `orient` → `docs/PROGRESS.md` + relevant sections of **`architecture-plan.md`**. After a slice: update `PROGRESS.md`.

## References

- Plan: `docs/architecture-plan.md`
- PRD / flows / glossary / theme / MCP setup under `docs/`
- Showcase: https://prd-showcase.vercel.app/
