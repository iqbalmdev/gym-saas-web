import { describe, expect, it } from 'vitest';

import type { HttpClient } from '@/lib/api/client';
import { createNutritionAdapter } from '@/modules/nutrition/nutrition-adapter';

type Recorded = { path: string; method?: string; body?: unknown };

/** Drives the real adapter so normalization and Zod parsing are what gets tested. */
function stubHttp(response: unknown): { http: HttpClient; calls: Recorded[] } {
    const calls: Recorded[] = [];
    const http: HttpClient = {
        request: async <T>(input: { path: string; method?: string; body?: unknown }): Promise<T> => {
            calls.push({ path: input.path, method: input.method, body: input.body });
            return response as T;
        },
    };
    return { http, calls };
}

const IDLI = {
    id: 'f00d0000-0000-4000-8000-000000000001',
    name: 'Idli',
    aliases: ['idly'],
    caloriesPer100g: 135,
    proteinGPer100g: 4,
    carbsGPer100g: 27,
    fatGPer100g: 0.5,
    defaultUnit: 'PIECE',
    units: [
        {
            id: 'f00d5e04-0000-4000-8000-000000010001',
            unit: 'G',
            label: 'g',
            grams: 1,
            calories: 1.35,
            proteinG: 0.04,
            carbsG: 0.27,
            fatG: 0.01,
            isDefault: false,
        },
        {
            id: 'f00d5e04-0000-4000-8000-000000010003',
            unit: 'PIECE',
            label: 'piece',
            grams: 30,
            calories: 40.5,
            proteinG: 1.2,
            carbsG: 8.1,
            fatG: 0.15,
            isDefault: true,
        },
    ],
};

const DAY = {
    calorieLog: {
        logDate: '2026-08-17',
        totalCalories: 81,
        totalProteinG: 2.4,
        totalCarbsG: 16.2,
        totalFatG: 0.3,
        slots: [
            {
                mealSlot: 'BREAKFAST',
                totalCalories: 81,
                totalProteinG: 2.4,
                totalCarbsG: 16.2,
                totalFatG: 0.3,
                items: [
                    {
                        id: 'c1111111-1111-4111-8111-111111111111',
                        foodItemId: 'f00d0000-0000-4000-8000-000000000001',
                        servingId: 'f00d5e04-0000-4000-8000-000000010003',
                        quantity: 2,
                        mealSlot: 'BREAKFAST',
                        dietPlanMealItemId: null,
                        calories: 81,
                        proteinG: 2.4,
                        carbsG: 16.2,
                        fatG: 0.3,
                        isExtra: true,
                    },
                ],
            },
            { mealSlot: 'DINNER', totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0, items: [] },
        ],
    },
};

describe('nutrition adapter (Postman examples)', () => {
    it('parses Search Foods with servings', async () => {
        const { http, calls } = stubHttp({ foods: [IDLI] });

        const { foods } = await createNutritionAdapter(http).searchFoods({ accessToken: 'token', query: 'idli' });

        expect(calls[0]?.path).toBe('/foods/search?q=idli');
        expect(foods[0]?.name).toBe('Idli');
        expect(foods[0]?.aliases).toEqual(['idly']);
        expect(foods[0]?.units.find((unit) => unit.isDefault)?.id).toBe('f00d5e04-0000-4000-8000-000000010003');
        expect(foods[0]?.units.find((unit) => unit.isDefault)?.label).toBe('piece');
    });

    it('sends an empty q for the full seed catalog', async () => {
        const { http, calls } = stubHttp({ foods: [] });

        await createNutritionAdapter(http).searchFoods({ accessToken: 'token' });

        expect(calls[0]?.path).toBe('/foods/search?q=');
    });

    it('parses Get My Calorie Log with slots and items', async () => {
        const { http, calls } = stubHttp(DAY);

        const { calorieLog } = await createNutritionAdapter(http).getMyCalorieLog({
            accessToken: 'token',
            date: '2026-08-17',
        });

        expect(calls[0]?.path).toBe('/me/calorie-logs?date=2026-08-17');
        expect(calorieLog.logDate).toBe('2026-08-17');
        expect(calorieLog.totalCalories).toBe(81);
        expect(calorieLog.slots).toHaveLength(2);
        expect(calorieLog.slots[0]?.items[0]?.quantity).toBe(2);
        expect(calorieLog.slots[0]?.items[0]?.isExtra).toBe(true);
    });

    it('omits the date param so the API resolves today in Asia/Kolkata', async () => {
        const { http, calls } = stubHttp(DAY);

        await createNutritionAdapter(http).getMyCalorieLog({ accessToken: 'token' });

        expect(calls[0]?.path).toBe('/me/calorie-logs');
    });

    it('coerces PG numeric strings and snake_case keys, and derives isExtra', async () => {
        const { http } = stubHttp({
            calorieLog: {
                log_date: '2026-08-17',
                total_calories: '81',
                total_protein_g: '2.40',
                total_carbs_g: '16.20',
                total_fat_g: '0.30',
                slots: [
                    {
                        meal_slot: 'BREAKFAST',
                        total_calories: '81',
                        total_protein_g: '2.40',
                        total_carbs_g: '16.20',
                        total_fat_g: '0.30',
                        items: [
                            {
                                id: 'item-1',
                                food_item_id: 'food-1',
                                serving_id: 'serving-1',
                                quantity: '2',
                                meal_slot: 'BREAKFAST',
                                diet_plan_meal_item_id: 'plan-item-1',
                                calories: '81',
                                protein_g: '2.40',
                                carbs_g: '16.20',
                                fat_g: '0.30',
                            },
                        ],
                    },
                ],
            },
        });

        const { calorieLog } = await createNutritionAdapter(http).getMyCalorieLog({ accessToken: 'token' });

        expect(calorieLog.totalCalories).toBe(81);
        expect(calorieLog.totalProteinG).toBe(2.4);
        const item = calorieLog.slots[0]?.items[0];
        expect(item?.foodItemId).toBe('food-1');
        expect(item?.quantity).toBe(2);
        expect(item?.dietPlanMealItemId).toBe('plan-item-1');
        // Plan-linked line: isExtra is false even though the key was absent.
        expect(item?.isExtra).toBe(false);
    });

    it('posts Log Extra Food and returns the refreshed day', async () => {
        const { http, calls } = stubHttp(DAY);

        const { calorieLog } = await createNutritionAdapter(http).logExtraFood({
            accessToken: 'token',
            foodItemId: IDLI.id,
            servingId: 'f00d5e04-0000-4000-8000-000000010003',
            quantity: 1,
            mealSlot: 'LUNCH',
        });

        expect(calls[0]?.path).toBe('/me/calorie-logs/items');
        expect(calls[0]?.method).toBe('POST');
        expect(calls[0]?.body).toEqual({
            foodItemId: IDLI.id,
            servingId: 'f00d5e04-0000-4000-8000-000000010003',
            quantity: 1,
            mealSlot: 'LUNCH',
        });
        expect(calorieLog.logDate).toBe('2026-08-17');
    });

    it('targets the item path on Unlog Extra Food and returns the refreshed day', async () => {
        const { http, calls } = stubHttp({
            calorieLog: { ...DAY.calorieLog, totalCalories: 0, slots: [] },
        });

        const { calorieLog } = await createNutritionAdapter(http).unlogExtraFood({
            accessToken: 'token',
            itemId: 'c1111111-1111-4111-8111-111111111111',
        });

        expect(calls[0]?.path).toBe('/me/calorie-logs/items/c1111111-1111-4111-8111-111111111111');
        expect(calls[0]?.method).toBe('DELETE');
        expect(calorieLog.totalCalories).toBe(0);
    });

    it('reads the staff diary against the gym-scoped path', async () => {
        const { http, calls } = stubHttp(DAY);

        await createNutritionAdapter(http).getStaffClientCalorieLog({
            accessToken: 'token',
            gymOrgId: 'gym-1',
            clientUserId: 'client-1',
            date: '2026-08-17',
        });

        expect(calls[0]?.path).toBe('/gym-orgs/gym-1/clients/client-1/calorie-logs?date=2026-08-17');
    });
});
