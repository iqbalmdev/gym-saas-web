# 2026-09-11 — M9 Nutrition log extra (Postman `5c3ee88`)

Unblocks `POST /me/calorie-logs/items` after the sibling Postman tip added serving
`id` on each `GET /foods/search` `units[]` row.

## What shipped

- **`FoodServing.id`** parsed in the nutrition adapter (Zod + normalization).
- **`logExtraFood`** writer on the port → adapter → use-case → Server Action →
  `useLogExtraFood` hook.
- **Food catalog panel** — meal picker + quantity + **Log** per search hit (default
  serving).
- **E2E fixture** implements the writer; catalog seed units carry stable serving
  ids; Playwright spec logs Chapati from the catalog (serial Nutrition block).

## Postman sync

Sibling pulled to **`5c3ee88`** (`docs: refresh Attendance visit check-out Postman
Docs`). Cloud inject still blocked (Postman MCP 401) — Desktop Import from sibling
JSON when needed.

## Verification

Nutrition Vitest (14 tests) green after the change.
