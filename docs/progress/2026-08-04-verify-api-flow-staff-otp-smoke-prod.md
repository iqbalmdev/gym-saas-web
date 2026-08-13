# 2026-08-04 — verify-api-flow STAFF OTP smoke (prod)

- Email `mohammediqbalbe@gmail.com` against `https://gym-backend-lovat-mu.vercel.app`.
- Request OTP `202 OTP_SENT` → Verify `200` → `/auth/me` `200` → `GET /gym-orgs` `200` `{ gymOrgs: [] }`.
- User: `lane=STAFF`, `roleCode=STAFF_UNASSIGNED`, `staffCode=STF-1E0E7EEAD126` (first provision / unassigned owner path).
- Ran via direct HTTP (Postman MCP still 401). Tokens not stored in repo.
