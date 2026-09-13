import { describe, expect, it } from 'vitest';

import { ApiClientError } from '@/lib/api/errors';
import { E2E_CLIENT_TOKEN, E2E_GYM_ID } from '@/lib/api/e2e/store';
import { createE2eNutritionAdapter } from '@/modules/nutrition/nutrition-e2e-fixtures';

describe('nutrition e2e fixtures', () => {
    const adapter = createE2eNutritionAdapter();

    it('returns the seed catalog for an empty search', async () => {
        const { foods } = await adapter.searchFoods({ accessToken: E2E_CLIENT_TOKEN, query: '' });
        expect(foods.map((food) => food.name)).toEqual(['Idli', 'Chapati']);
    });

    it('filters foods by name and alias', async () => {
        const { foods } = await adapter.searchFoods({ accessToken: E2E_CLIENT_TOKEN, query: 'roti' });
        expect(foods).toHaveLength(1);
        expect(foods[0]?.name).toBe('Chapati');
    });

    it('refuses staff diary reads without a CALORIES grant', async () => {
        let error: unknown;
        try {
            await adapter.getStaffClientCalorieLog({
                accessToken: 'staff-token',
                gymOrgId: E2E_GYM_ID,
                clientUserId: 'e2e-client-roster-1',
            });
        } catch (caught) {
            error = caught;
        }

        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).code).toBe('NUTRITION_FORBIDDEN');
    });

    it('returns a shared diary when CALORIES is granted', async () => {
        const { calorieLog } = await adapter.getStaffClientCalorieLog({
            accessToken: 'staff-token',
            gymOrgId: E2E_GYM_ID,
            clientUserId: 'e2e-client-roster-2',
        });

        expect(calorieLog.slots).toHaveLength(5);
        expect(calorieLog.slots.find((slot) => slot.mealSlot === 'DINNER')?.items[0]?.quantity).toBe(2);
    });

    it('logs an extra diary line and refreshes totals', async () => {
        const before = await adapter.getMyCalorieLog({ accessToken: E2E_CLIENT_TOKEN });
        expect(before.calorieLog.totalCalories).toBe(81);

        const { calorieLog } = await adapter.logExtraFood({
            accessToken: E2E_CLIENT_TOKEN,
            foodItemId: 'f00d0000-0000-4000-8000-000000000002',
            servingId: 'f00d5e04-0000-4000-8000-000000020003',
            quantity: 1,
            mealSlot: 'DINNER',
        });

        expect(calorieLog.totalCalories).toBeCloseTo(199.8, 1);
        expect(calorieLog.slots.find((slot) => slot.mealSlot === 'DINNER')?.items[0]?.quantity).toBe(1);
    });

    it('removes an extra diary line and refreshes totals', async () => {
        const before = await adapter.getMyCalorieLog({ accessToken: E2E_CLIENT_TOKEN });
        expect(before.calorieLog.slots.find((slot) => slot.mealSlot === 'BREAKFAST')?.items).toHaveLength(1);

        const { calorieLog } = await adapter.unlogExtraFood({
            accessToken: E2E_CLIENT_TOKEN,
            itemId: 'c1111111-1111-4111-8111-111111111111',
        });

        expect(calorieLog.slots.find((slot) => slot.mealSlot === 'BREAKFAST')?.items).toHaveLength(0);
        expect(calorieLog.slots.find((slot) => slot.mealSlot === 'DINNER')?.items[0]?.quantity).toBe(1);
    });
});
