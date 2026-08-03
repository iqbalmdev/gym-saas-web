# Architecture Plan — Gym SaaS Web (S2)

**Status:** Accepted baseline for this repo  
**Audience:** Humans + AI agents implementing features  
**Product sources:** `docs/PRD.md` · `docs/product-flows.md` · `docs/CONTEXT.md`  
**Companion summary:** `docs/architecture.md`  
**Showcase:** https://prd-showcase.vercel.app/

This plan is the **build contract** for the Next.js web app. Agent skills (`orient`, `implement-feature`, Matt Pocock `/implement`) must follow it. Do not invent alternate stacks, tenancy models, or persona boundaries without an ADR.

---

## 1. System context

```text
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────────────┐
│ S1 Mobile       │     │ S2 Web (THIS REPO)       │     │ S3 API & data       │
│ React Native    │────▶│ Next.js App Router       │────▶│ Express + Supabase  │
│ Client+Trainer  │ HTTP│ Admin now; Trainer/Client│ JWT │ Auth, tenancy, jobs │
│ (+ light Admin) │     │ web later                │ OTP │ Postgres, storage   │
└─────────────────┘     └──────────────────────────┘     └─────────────────────┘
```

| Surface | Repo role |
|---|---|
| **S2 Web** | **Implement here.** UI + typed API client + session. No domain DB ownership. |
| **S3 API** | Source of truth for entitlements, grants, tenancy. Called over HTTPS. |
| **S1 Mobile** | Separate app; same domain language and API contracts. |

**Non-negotiable:** Business rules (membership ACTIVE, subscription dates, DataGrants, block check-in) live in **S3**. Web displays API state and posts user intent — it does not re-derive entitlement in JSX.

---

## 2. Goals of this architecture

1. **Admin-first delivery** without locking out Trainer/Client web later (ADR-0002).
2. **One Next.js app**, persona route groups, shared `lib/*`.
3. **Gym tenancy** on every staff data path (`gym_org_id` from session/affiliation).
4. **Grant-safe UI** for Client-owned data (empty states, never fake data).
5. **Token-based theme** so CRM-light look can change without rewriting features.
6. **Agent-operable:** stage in `PROGRESS.md`, modules map to folders, slices are vertical.
7. **SOLID + DI/DIP:** presentation depends on ports; HTTP is an adapter; deep modules (ADR-0004).

---

## 3. Locked technology choices (web)

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js App Router + TypeScript | Strict TS; no `any` |
| Rendering | Server Components default | `"use client"` only for interaction |
| Auth UX | Email OTP canonical; Google + verified email | No Facebook / phone OTP |
| API access | Typed HTTP client in `lib/api` | Bearer access token; refresh handled in auth layer |
| Theme | CSS variables / token maps | See `docs/ui-theme.md` |
| Deploy target | Vercel (expected) | MCP available |
| E2E / smoke | Playwright MCP | After scaffold |
| API exploration | Postman MCP | OTP → token → Admin routes |
| DB visibility (dev) | Supabase MCP | Prefer **dev** project; API still owns writes for app features |

Changes to this table require an ADR under `docs/adr/`.

---

## 4. Logical layers (this repo)

Inspired by pragmatic Clean Architecture in React ([Kondov](https://alexkondov.com/full-stack-tao-clean-architecture-react/)): separate what changes at different rates; keep components close to pure render; hide transport and domain presentation behind deep modules.

```text
┌──────────────────────────────────────────────────────────┐
│ Presentation  app/(persona)/*, components/*              │  props → markup; named event handlers only
├──────────────────────────────────────────────────────────┤
│ Application   lib/features/*/use-cases, hooks            │  orchestrate; map to view models; depend on PORTS
├──────────────────────────────────────────────────────────┤
│ Ports         lib/ports/* (interfaces)                   │  RenewalsReader, GymOrgWriter, AuthGateway, …
├──────────────────────────────────────────────────────────┤
│ Adapters      lib/api/*  (HTTP), lib/auth/session, …     │  implement ports; endpoints + schema validation
├──────────────────────────────────────────────────────────┤
│ Display       lib/display/*                              │  pure DTO → labels/badges/relative dates
├──────────────────────────────────────────────────────────┤
│ Design system lib/theme, components/ui                   │  tokens only — no domain rules
└──────────────────────────────────────────────────────────┘
         │ HTTPS (adapter)
         ▼
   S3 Express API + Supabase   ← real domain authority
```

**Dependency rule (DIP):** arrows of *source dependencies* point inward/up toward ports and presentation contracts — never Presentation → concrete `fetch`. Adapters depend on ports by *implementing* them; composition root binds port → adapter.

```text
Composition root (route / server entry / factory)
  creates HttpClient
  binds RenewalsReader → HttpRenewalsAdapter
  calls ListRenewals use-case
  passes view-model + handlers into Presentational component
```

### SOLID mapping

| Principle | Practice here |
|---|---|
| **S** | One reason to change per unit: JSX layout ≠ HTTP ≠ grant empty-state copy mapping |
| **O** | New Admin screens add use-cases/adapters; don’t fork the HTTP kernel |
| **L** | Fake ports in tests behave like production contracts |
| **I** | Small ports per access pattern (`listRenewals`, `markDeskAttendance`) — not one mega API in every component |
| **D** | Use-cases import port *types*; only composition root imports `lib/api` concretes |

### Dependency injection

- **Prefer:** factory or function args — `createListRenewals({ renewals: RenewalsReader })`.
- **Hooks:** `useRenewalsInbox({ renewals })` receives the port (or a pre-bound use-case), not a hard-coded import of axios.
- **Avoid:** reaching for globals/`window` fetch inside feature modules; Context only when truly cross-tree session UI — not as a dumping ground for every repository.
- **Tests:** inject in-memory fakes implementing the port.

### Layer rules

| Layer | May | Must not |
|---|---|---|
| Presentation | Render view models; call named handlers; show grant-missing empty states | `fetch`, dayjs, entitlement math, payment→lock logic |
| Application / hooks | Orchestrate ports; build view models; loading/error policy | Own HTTP URLs; contain large JSX trees |
| Ports | Declare async contracts + DTO types | Know React or CSS |
| Adapters (`lib/api`) | HTTP, auth headers, zod/schema parse, endpoint constants | JSX; business “should we lock check-in?” |
| Display | Pure formatters/mappers | Network I/O |
| Theme | Semantic tokens | Feature hex hardcoding |

### Example shape (Renewals inbox)

```typescript
// lib/ports/renewals.ts
export type RenewalsReader = {
  listDueWithinDays: (input: { days: number; gymOrgId: string }) => Promise<RenewalLineDto[]>;
};

// lib/api/renewals-adapter.ts — implements RenewalsReader (HTTP + schema)

// lib/features/renewals/list-renewals.ts — use-case depends on RenewalsReader only

// components/admin/renewals-inbox.tsx — receives RenewalRowViewModel[] + onOpenMember
```

### Kondov habits we keep

- Ask access-pattern questions before locking API assumptions.
- First draft OK; **extract layers before merge**.
- Prefer **deep modules** (small export surface).
- Named `endpoints` / `queryKeys` next to transport.
- Validate at the boundary — don’t trust casts alone.

---

## 5. Target folder structure

```text
gym-admin-web/
├── app/
│   ├── layout.tsx                 # root: fonts, theme CSS vars
│   ├── (auth)/
│   │   ├── login/                 # OTP request + verify; lane chooser
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── layout.tsx             # Admin chrome + gym scope guard (composition root for admin)
│   │   ├── page.tsx               # dashboard (P1 ok to stub)
│   │   ├── renewals/              # M4 + M12 inbox (wedge)
│   │   ├── crm/                   # M11 leads pipeline
│   │   ├── members/               # M3 roster + invites
│   │   ├── attendance/            # M5 desk mark + logs
│   │   ├── plans/                 # M4 catalog
│   │   └── settings/              # M2 gym profile / branding
│   ├── (trainer)/                 # Phase B — do not delete the group idea
│   ├── (client)/                  # Phase B — optional web
│   └── api/                       # optional BFF route handlers only if ADR’d
├── components/
│   ├── ui/                        # buttons, table, empty-state, badges
│   ├── admin/                     # presentational + thin composition
│   ├── trainer/                   # Phase B
│   └── client/                    # Phase B
├── lib/
│   ├── ports/                     # interfaces (DIP) — RenewalsReader, AuthGateway, …
│   ├── api/                       # adapters: HTTP client, endpoints, schema, *Adapter
│   ├── features/                  # use-cases / hooks per module (depend on ports)
│   │   ├── renewals/
│   │   ├── members/
│   │   └── …
│   ├── auth/                      # session gateway adapter + guards
│   ├── theme/
│   └── display/                   # pure mappers (DTO → labels/badges)
├── docs/                          # product + this plan + PROGRESS
├── .cursor/                       # rules, project skills, mcp.json
└── .agents/skills/                # Matt Pocock skills
```

Scaffold must create `(auth)` + `(admin)` first; leave empty placeholders or documented stubs for `(trainer)` / `(client)` so paths stay reserved. Introduce `lib/ports` + one sample adapter early so DI is real, not aspirational.

---

## 6. Module → route map (Admin Phase A)

| Module | Admin web routes (intent) | Priority |
|---|---|---|
| M1 Identity | `(auth)/login`, session guard | P0 |
| M2 Gym Org | `(admin)/settings` (profile, branding, timezone) | P0 |
| M3 Members | `(admin)/members`, invite create, offboard, block check-in | P0 |
| M4 Plans & billing | `(admin)/plans`, assign lines, payment badges | P0 |
| M4 + M12 Renewals | `(admin)/renewals` (T-2 + unpaid nudge inbox) | P0 wedge |
| M5 Attendance | `(admin)/attendance` desk mark + logs | P0 |
| M11 CRM | `(admin)/crm` pipeline + follow-ups | P0 |
| M6–M10 | Grant-aware **views** only when Admin needs them; no Client calorie editor in Admin | Later / gated |
| M13 | Via API (audit consumed as history panes) | Indirect |

**Delivery order (tracer bullets):**  
M1 → M2 → M4 catalog → M4/M12 renewals inbox → M3 roster/invites → M5 desk → M11 CRM → grant-aware member detail.

---

## 7. Auth & tenancy plan

```text
User → lane chooser (CLIENT | STAFF)
     → email OTP (or Google → verified email)
     → session (access + refresh)
     → STAFF_UNASSIGNED: show waiting / staff_code (web)
     → ADMIN affiliation: enter (admin)/* with active gym_org_id
     → TRAINER affiliation: Phase B (trainer)/*
     → CLIENT: Phase B (client)/* or redirect “use mobile”
```

### Rules

- Session established only after OTP/Google verify (API).
- Admin shell requires `ADMIN` role + gym affiliation.
- Every Admin API call sends auth; server scopes by `gym_org_id`.
- MVP UI: **single active gym** (no branch switcher) even if owner has multiple orgs in DB.
- Client cannot accept staff invites on a Client account (and vice versa) — enforce via API; UI must not offer cross-lane actions.

---

## 8. Data ownership & UI behavior

| Class | Examples | Admin UI |
|---|---|---|
| **Gym-owned** | membership, invites, subscriptions, attendance, leads, plan catalog | Full CRUD per role; no DataGrant |
| **Client-owned** | profile fields, progress, calories, wearables, plan completions | Show only if grant; else calm empty: “Member has not shared X” |

### Billing vs access (global)

- Entitlement = **subscription dates**, not `payment_status`.
- `unpaid` / `partial` → badges + renewals/unpaid inbox — **not** auto lock.
- Check-in lock = manual **block check-in** only.
- Coaching hard-stop = Trainer addon expiry / Admin end addon.

Implement display mappers in `lib/display`; never branch “deny check-in because unpaid” in the web UI.

---

## 9. API client contract (web)

Adapters live under `lib/api` and **implement** ports from `lib/ports`.

```text
lib/ports/
  renewals.ts        # RenewalsReader, …
  auth.ts            # AuthGateway
  …
lib/api/
  client.ts          # base URL, auth header, refresh retry once
  endpoints.ts       # named path constants
  errors.ts          # map status → calm user message codes
  renewals-adapter.ts
  auth-adapter.ts
  …
lib/features/
  renewals/list-renewals.ts   # use-case(deps: { renewals: RenewalsReader })
```

- Prefer generated or hand-typed DTOs matching Postman/OpenAPI when available.
- Validate responses at the adapter boundary (schema) before use-cases see data.
- Errors: never dump raw payloads in UI (error-handling rule).
- Verification path: Postman MCP / `verify-api-flow` skill (OTP → token → endpoint).
- Composition root binds port → adapter; features never import adapter concretes directly when a port exists.
---

## 10. UI / theme architecture

- Default mood: soft light CRM/ops (`docs/ui-theme.md`).
- All components consume semantic CSS variables.
- Theme swap = token file change, not feature rewrites.
- Admin density: tables, inboxes, pipelines over decorative card walls.

---

## 11. Cross-cutting quality bars

| Area | Bar |
|---|---|
| Types | Strict TypeScript; no `any` |
| Tests | Vertical slice / TDD at seams (`/tdd`); timezone helpers; grant empty states |
| A11y | Keyboard for tables/forms; clear empty/error copy |
| Security | No secrets in git; MCP on **dev** Supabase; tenancy always server-enforced |
| i18n | English only MVP |
| Observability | User-facing calm errors; server logs later |

---

## 12. Agent OS ↔ architecture (how work must proceed)

```text
orient → read PROGRESS + this plan (relevant section)
      → grill-with-docs / to-spec if ambiguous
      → to-tickets (tracer bullets aligned to §6 order)
      → implement-feature /implement + tdd
      → verify-api-flow / Playwright
      → code-review (Standards + Spec vs PRD + this plan)
      → update PROGRESS.md
```

### Compliance checklist (every feature PR)

- [ ] Persona + module named (Admin/Trainer/Client + M#)
- [ ] Fits folder map in §5 (no random top-level feature dumps)
- [ ] Depends on **ports**; HTTP only in adapters (`lib/api`) — no `fetch` in JSX (ADR-0004)
- [ ] Display/entitlement *presentation* mapping outside JSX (`lib/display` / use-case)
- [ ] Honors grants / billing≠access (§8) — API remains authority
- [ ] Theme tokens only
- [ ] Does not block future `(trainer)` / `(client)`
- [ ] `docs/PROGRESS.md` updated

---

## 13. Explicit non-goals (do not build into architecture)

Payment gateway · WhatsApp/SMS · open join codes · multi-branch switcher · custom RBAC · QR/geofence check-in · Facebook login · Hindi UI · Express domain logic inside this repo (unless BFF ADR) · React Native in this repo · copying Client-owned rows into gym tables

---

## 14. Open architecture decisions (track; don’t block scaffold)

| ID | Topic | Interim stance |
|---|---|---|
| A1 | Exact API base URL / env naming | `NEXT_PUBLIC_API_BASE_URL` + server-only secrets as needed |
| A2 | Session storage (httpOnly cookie vs memory + BFF) | Prefer httpOnly session cookie via Next route handlers once scaffolded — confirm in ADR when implementing M1 |
| A3 | OpenAPI vs hand types | Hand types until API exports OpenAPI; then generate |
| A4 | Client web in MVP showcase | Deferred Phase B; mobile primary for Client |

When A2 is decided, write `docs/adr/0003-web-session.md` (or next free number if taken).

---

## 15. References

- PRD §§1.2, 5.x, 7.5, 9, 13  
- `docs/product-flows.md` — journeys A–D, Admin screens  
- `docs/CONTEXT.md` — GymOrg, DataGrant, Subscription line, Lead  
- ADR-0001 Agent OS first · ADR-0002 Multi-persona web · ADR-0003 Architecture plan · ADR-0004 SOLID/DI Clean Architecture
- Clean Architecture reference: https://alexkondov.com/full-stack-tao-clean-architecture-react/
