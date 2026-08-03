# ADR 0001 — Agent OS first, app scaffold second

## Status

Accepted

## Context

We are building Gym SaaS Admin web (Next.js) with AI agent assistance. Starting with feature UI before rules/skills/docs causes agents to invent product behavior and project stage.

## Decision

Bootstrap this repository with:

- Product docs (`PRD`, `product-flows`, `CONTEXT`, `architecture`, `ui-theme`, `PROGRESS`)
- Cursor rules and skills
- GitHub remote for local-first development

Defer Next.js app scaffolding and feature modules until the agent OS is committed. UI theme is token-based and changeable; soft light CRM direction is default mood only.

## Consequences

- Agents must read `PROGRESS` + orient before non-trivial work.
- First application commits come after this ADR’s bootstrap.
- Matt Pocock engineering skills may be installed optionally without blocking this ADR.
