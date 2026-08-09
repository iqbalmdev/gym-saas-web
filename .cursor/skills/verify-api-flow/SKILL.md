---
name: verify-api-flow
description: Use after implementing or changing anything that calls the Express API from the Next.js Admin app, or whenever the user asks to confirm an end-to-end flow (e.g. "does the renewal flow actually work", "check the invite -> accept -> DataGrant chain"). Verifies the real request/response, not just that the code compiles.
---

# Verify API flow

Confirms an integration actually works end-to-end against the real (or
locally running) Express API — not just that TypeScript types line up.

## Steps

1. Identify the full chain for the flow being verified, e.g.:
   `Admin sends invite -> Client accepts -> DataGrant created -> Admin can
   read progress if grant scope matches`.
2. Check `lib/api/<module>.ts` — does the request payload match what the
   Express route actually expects? Cross-check against
   `docs/PRD.md` and, if present, the Postman collection
   (see sync-postman-collection).
3. If the API is running locally, exercise the flow with a real request
   (curl or a small script) rather than trusting the TS types alone —
   types can drift from the actual API contract.
4. Confirm the response shape matches what `lib/api` expects to parse. A
   mismatch here fails silently in production if not caught now.
5. Confirm error responses (401/403/404/422) are handled per
   error-handling.mdc — trigger at least one failure case deliberately
   (e.g. call with no grant) and confirm the UI shows the right state.
6. Report back: which steps of the chain were verified against a real
   response vs. only checked at the type level. Don't claim "verified"
   for anything not actually exercised.
7. If a mismatch is found between the PRD/Postman contract and the actual
   API behavior, flag it rather than silently adjusting the frontend to
   match — that may be an API bug, not a frontend bug.
