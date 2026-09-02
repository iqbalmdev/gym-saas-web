# 2026-08-29 — M9 Nutrition (food diary + catalog)

Wires the Nutrition folder of the Postman collection into the Client surface and
the member detail page, following the `implement-feature` slice shape
(ports → adapter → use-cases → services → actions/queries → hooks → UI).

## What shipped

**Member — `/client/nutrition`**

- **Food diary.** Day totals (calories, protein, carbs, fat) and all five meal
  slots, empty ones included, as the API returns them. Extra lines carry a
  **Remove**; plan-linked lines carry a "From plan" badge and no Remove, because
  `DELETE /me/calorie-logs/items/:itemId` answers `422 INVALID_NUTRITION` for
  them — those are uncompleted on the diet plan (M6), not deleted here.
- **Day picker.** Omitting `date` is its own query key rather than "today's
  date": the API resolves the default day in Asia/Kolkata, so guessing it in the
  browser would both split the cache and pick the wrong day for anyone outside
  IST. Only an explicit pick sends `?date=`.
- **Food catalog.** `GET /foods/search`, debounced at 250 ms with
  `keepPreviousData` so results do not flash on each keystroke.

**Staff — member detail**

- CALORIES-gated diary panel. `NUTRITION_FORBIDDEN` renders "Member has not
  shared their food diary with this gym", never a blank panel. Read-only: only
  the member edits their own diary.

## Logging food is blocked on the API

`POST /me/calorie-logs/items` requires `foodItemId` **and** `servingId`, but the
search DTO deliberately omits serving ids — the collection says so outright:

> Search DTO `units[]` does not include serving `id`. Use the default unit then
> copy `servingId` from a diary/plan response, or from `GET` after assign.

Every endpoint was checked: `servingId` appears only inside a diary line or a
diet-plan item, i.e. only for a food the member has *already* logged or been
prescribed. There is no path from "search idli" to "log 2 idlis", so the web
cannot offer an Add-food form without inventing an id. No writer was added for
it — the port carries `unlogExtraFood` only, so nothing dead ships.

**Backend ask:** include the serving `id` in `GET /foods/search` `units[]` (or
add a `GET /foods/:id` that returns servings with ids). The UI is otherwise
ready: the catalog panel already renders per-serving macros.

## Notes

- Diary lines carry `foodItemId` but **no food name**. The unfiltered catalog
  (empty `q` returns the full seed list, per the contract) is fetched in the RSC
  and passed down as an id → name map, so both the member and staff views read
  as food rather than uuids. Names are stable, so a diary refetch does not
  re-fetch them.
- `CalorieLogDay` is shared by both surfaces; the staff view simply omits
  `onRemoveItem`, which is what makes it read-only.
- The unlog mutation is owned by the diary, not by a row: removing a line moves
  both slot and day totals, and a row owning the mutation would unmount with its
  own error state.

## Verification

`tsc --noEmit`, `eslint --max-warnings=0`, 84 Vitest unit tests (7 new adapter
tests covering the Postman examples, PG-numeric strings, snake_case keys, and
`isExtra` derived from `dietPlanMealItemId`), and 40 Playwright specs — all
green.

One trap worth recording: Playwright's `webServer` runs `npm run start`, which
does **not** build. The first run served a stale `.next` and failed all three new
specs against the old "Coming soon" stub. Run `npm run build` before the suite
after adding a route.
