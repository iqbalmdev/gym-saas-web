# 2026-09-13 — Admin coaching (M6/M7 staff slice)

Completed the remaining Postman Coaching folder endpoints for staff/admin.

## API wired

- Diet plan templates: list, create, get, patch, delete, duplicate
- Workout plan templates: same
- Assign diet plan from template (`POST …/clients/:clientUserId/diet-plans`)
- Staff read client diet plan, workout schedule (date range), workout streak
- Upsert client workout schedule (`PUT …/workout-schedule`)
- Exercise catalog search on `CoachingReader` (adapter + E2E fake; no BFF/UI yet)

## UI

- `/admin/coaching` index + `/admin/coaching/diet-templates` + `/admin/coaching/workout-templates`
- Member detail: `StaffClientDietPlanPanel`, `StaffClientWorkoutScheduleUpsert`, `StaffClientWorkoutSchedulePanel`
- Admin nav: Coaching (Dumbbell)

## Architecture

Extended `modules/coaching/*` (ports, adapter, actions, queries, hooks, BFF under `app/api/coaching/*` and `app/api/gym-orgs/clients/[clientUserId]/*`). Staff gate via `requireStaffGym()`. Workout schedule/streak staff reads use `GrantAware` when `WORKOUT_PLANS` grant is missing.

## Tests

- `coaching-adapter.test.ts`: +2 staff endpoint tests
- Vitest: 175 passed

## Deferred

- Interactive workout template builder with live exercise search (port exists; MVP uses hardcoded catalog ids)
- Admin E2E for template CRUD / assign flows
