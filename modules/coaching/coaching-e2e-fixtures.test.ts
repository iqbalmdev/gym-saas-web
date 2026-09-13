import { describe, expect, it } from 'vitest';

import { ApiClientError } from '@/lib/api/errors';
import { E2E_CLIENT_TOKEN, E2E_GYM_ID, E2E_DIET_PLAN_ITEM_ID, E2E_SCHEDULE_EXERCISE_ID } from '@/lib/api/e2e/store';
import { isoWeekRangeLocal } from '@/modules/coaching/coaching-week-range';
import { createE2eCoachingAdapter } from '@/modules/coaching/coaching-e2e-fixtures';

describe('coaching e2e fixtures', () => {
    const adapter = createE2eCoachingAdapter();

    it('returns the seeded diet plan with Idli breakfast', async () => {
        const { dietPlan } = await adapter.getMyDietPlan({
            accessToken: E2E_CLIENT_TOKEN,
            gymOrgId: E2E_GYM_ID,
        });
        expect(dietPlan?.title).toBe('Cut week');
        expect(dietPlan?.meals[0]?.items[0]?.id).toBe(E2E_DIET_PLAN_ITEM_ID);
        expect(dietPlan?.meals[0]?.items[0]?.logged).toBe(false);
    });

    it('returns the workout schedule for the current week', async () => {
        const { from, to } = isoWeekRangeLocal();
        const schedule = await adapter.getMyWorkoutSchedule({
            accessToken: E2E_CLIENT_TOKEN,
            gymOrgId: E2E_GYM_ID,
            from,
            to,
        });
        expect(schedule.days.length).toBeGreaterThan(0);
        expect(schedule.days[0]?.sessions[0]?.exercises[0]?.id).toBe(E2E_SCHEDULE_EXERCISE_ID);
    });

    it('toggles diet item completion', async () => {
        await adapter.completeDietItem({
            accessToken: E2E_CLIENT_TOKEN,
            gymOrgId: E2E_GYM_ID,
            itemId: E2E_DIET_PLAN_ITEM_ID,
        });
        const { dietPlan } = await adapter.getMyDietPlan({
            accessToken: E2E_CLIENT_TOKEN,
            gymOrgId: E2E_GYM_ID,
        });
        expect(dietPlan?.meals[0]?.items[0]?.logged).toBe(true);

        await adapter.uncompleteDietItem({
            accessToken: E2E_CLIENT_TOKEN,
            gymOrgId: E2E_GYM_ID,
            itemId: E2E_DIET_PLAN_ITEM_ID,
        });
        const again = await adapter.getMyDietPlan({
            accessToken: E2E_CLIENT_TOKEN,
            gymOrgId: E2E_GYM_ID,
        });
        expect(again.dietPlan?.meals[0]?.items[0]?.logged).toBe(false);
    });

    it('refuses duplicate diet completion', async () => {
        await adapter.completeDietItem({
            accessToken: E2E_CLIENT_TOKEN,
            gymOrgId: E2E_GYM_ID,
            itemId: E2E_DIET_PLAN_ITEM_ID,
        });

        let error: unknown;
        try {
            await adapter.completeDietItem({
                accessToken: E2E_CLIENT_TOKEN,
                gymOrgId: E2E_GYM_ID,
                itemId: E2E_DIET_PLAN_ITEM_ID,
            });
        } catch (caught) {
            error = caught;
        }
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).code).toBe('ALREADY_LOGGED_PRESCRIBED');
    });
});
