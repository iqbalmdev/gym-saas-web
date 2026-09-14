# 2026-08-29 — M10 Health Sync wired (member page + grant-gated staff panel)

Replaced the `/client/health` stub with a real slice against the Postman
**Health Sync** folder (sibling `gym-backend-postman` at `9b0b561`), and added
the staff read to member detail.

## What landed

New module `modules/health-sync/` following ADR-0007/0008 — one folder, one
import plus one spread in `lib/api/composition.ts`.

| Surface | Behaviour |
|---|---|
| Client `/client/health` | Connected apps (provider, last sync, Connected badge) with Connect / Disconnect; synced daily metrics table (steps, active kcal, workout minutes, weight, source) |
| Admin/Trainer member detail | `StaffClientWearablesPanel` — the same metrics table, or "Member has not shared wearable metrics" when the WEARABLES grant is absent |

Endpoints consumed, all from the collection — none invented:

- `GET /me/wearable-connections`
- `POST /me/wearable-connections` (`authRef: null`)
- `DELETE /me/wearable-connections/:provider`
- `GET /me/wearable-metrics`
- `GET /gym-orgs/:gymOrgId/clients/:clientUserId/wearable-metrics`

## Deliberately not built: a web "Sync now"

`POST /me/wearable-metrics/sync` is wired nowhere, and that is the point. The
collection describes it as "the mobile app pushes normalized daily metrics
after reading Health Connect locally", and PRD §M10 / flows F10.1–F10.2 put the
read behind an OS permission sheet. A browser cannot read Health Connect, so
the only way to drive that endpoint from web is a form where a member types in
their own step count — inventing Client-owned health data, which §M10's
"read-only sync" rule forbids. Connect and Disconnect are here because
registering and revoking a provider are honest browser actions; the metric push
stays on S1 Mobile.

## Grant handling

`HEALTH_SYNC_FORBIDDEN` (403) is the module's grant-missing code, not
`USERS_FORBIDDEN` as in Profile & Progress — the API uses a distinct code for
this folder. It is mapped in `health-sync-errors.ts` and converted to
`{ status: 'not_shared' }` in both the server query and the client hook, so a
missing grant renders calm copy on either path.

`GrantAware<T>` moved to `lib/domain/grant-aware.ts`; `profile-grant.ts` now
re-exports it, so no profile consumer changed. Two modules reading Client-owned
data behind grants should not each own a private copy of that type.

## Verification

- `npm run verify` green — 77 unit tests (up from 71; six new adapter tests
  drive the real adapter through a stub `HttpClient` rather than re-declaring
  schemas in the test).
- Playwright **37/37** (up from 34) via `playwright.chrome.config.ts`. The
  default config cannot launch on this host — bundled Chromium is missing for
  macOS 13 arm64, which is exactly why that config exists.
- New specs cover the seeded connection + metrics, a Connect/Disconnect round
  trip, and the not-shared staff panel. The mutation spec round-trips **Samsung
  Health** on purpose: fixture state is process-wide and the suite is
  `fullyParallel`, so touching the seeded Health Connect row would race the
  read-only spec.
