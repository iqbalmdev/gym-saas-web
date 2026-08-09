---
name: sync-postman-collection
description: Use whenever an Express API route is added, removed, or its request/response shape changes, or when the user asks to update the Postman collection. Keeps docs/postman/gym-saas.postman_collection.json as the accurate, current contract reference for the Admin web app to build against.
---

# Sync Postman collection

The Postman collection is the contract the Next.js Admin app is built
against — it must never drift silently from the real Express routes.

## Steps

1. Locate `docs/postman/gym-saas.postman_collection.json` (create it,
   with folders per module M1–M13, if it doesn't exist yet).
2. For a new/changed route, add or update the matching request:
   - Correct method, path, and module folder.
   - Request body example matching the actual zod/validation schema.
   - Example success response AND at least one example error response
     (401/403/404/422 as applicable).
   - Any required headers (auth token, tenant context).
3. Cross-check the collection's shape against `lib/api/<module>.ts` in the
   Next.js app — if they've diverged, flag which side is stale rather than
   guessing which one is correct.
4. Do not add example values that look like real user data — use clearly
   fake values (e.g. `client_demo_001`) since this file may be shared or
   committed.
5. Note the update in `docs/PROGRESS_LOG.md` if invoked as part of a
   larger feature (via `@progress-log`), so the contract change is
   traceable to the commit that caused it.
