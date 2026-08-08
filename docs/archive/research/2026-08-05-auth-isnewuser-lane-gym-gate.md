# Research: Auth `isNewUser`, lane chooser, and create-gym gate

> **Superseded (2026-08-06):** Staff with zero gyms now go to `/admin/settings` (Settings-only shell). `/onboarding/create-gym` redirects there. See `docs/PROGRESS.md` Settings-first entry.

**Date:** 2026-08-05  
**Question:** How should gym-saas-web implement email OTP signup/login with Staff vs Client, and gate Admin routes until a GymOrg exists?  
**Method:** Primary sources only — `docs/api/client-auth.md` (synced from Postman publish tip `d42602a8`), product-flows F1/M2, architecture-plan §7, live ports in this repo.

---

## 1. Executive summary

- There is still **no separate sign-up endpoint**. First successful OTP verify provisions the user. [[client-auth.md](../api/client-auth.md)]
- `POST /auth/otp/request` returns `{ status: "OTP_SENT", isNewUser: boolean }`. Collect lane only when `isNewUser: true`. [[client-auth.md](../api/client-auth.md)], [Postman `abdulhasibn/gym-backend-postman` @ `d42602a8`]
- `POST /auth/otp/verify` requires `lane` on first provision; omit when returning (`LANE_REQUIRED` if missing). [[client-auth.md](../api/client-auth.md)]
- Staff without affiliations should create a GymOrg before Admin desk modules. [[product-flows.md M2](../product-flows.md)], [[client-auth.md gym-orgs](../api/client-auth.md)]
- Client lane lands on `/client` (minimal web home); Admin chrome stays Staff-only. [[architecture-plan.md](../architecture-plan.md)], product posture Admin-first

---

## 2. Source inventory

| Source | Owns |
|--------|------|
| `docs/api/client-auth.md` | OTP shapes, `isNewUser`, optional lane, gym-orgs |
| GitHub `abdulhasibn/gym-backend-postman` tip `d42602a8` | Publish SSOT for collection/Examples |
| `docs/product-flows.md` F1.1–F1.3, M2 | Lane chooser + create gym journeys |
| `docs/architecture-plan.md` §4–7 | Ports/adapters, auth routes, Admin shell |
| This implementation | `resolvePostAuthPath`, `/onboarding/create-gym`, multi-step login |

---

## 3. Web flow (aligned with client-auth `isNewUser`)

1. **Email** → Request OTP  
2. If `isNewUser` → **lane** (STAFF / CLIENT) + optional name → OTP  
3. If returning → **OTP only** (no lane)  
4. Verify: send `lane` only when `isNewUser`  
5. Route:
   - CLIENT → `/client`
   - STAFF + `gymOrgs.length === 0` → `/onboarding/create-gym`
   - STAFF + has gym → `/admin`
6. Admin layout redirects to create-gym only when list returns **empty** — rethrow redirect errors  

---

## 4. Gaps / follow-ups

- Postman cloud inject may still need MCP re-login (`docs/postman-sync.md`).
- Client home is a calm placeholder until Phase B modules.
- Returning STAFF with `LANE_MISMATCH` if they somehow send the wrong lane — UI omits lane when `isNewUser: false`.
