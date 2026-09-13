/**
 * Playwright fixture adapter for M9 Nutrition (`GYM_SAAS_E2E_FIXTURES=1`).
 */
import { ApiClientError } from '@/lib/api/errors';
import {
    E2E_CLIENT_TOKEN,
    E2E_GYM_ID,
    e2eCalorieLogItems,
    e2eFoodCatalog,
    e2eStaffClientGrants,
    isoDateLocal,
} from '@/lib/api/e2e/store';
import { MEAL_SLOTS } from '@/modules/nutrition/nutrition-meal-slots';
import type { CalorieLog, CalorieLogItem, NutritionReader, NutritionWriter } from '@/modules/nutrition/nutrition-ports';

function clientUserIdForToken(accessToken: string): string {
    if (accessToken !== E2E_CLIENT_TOKEN) {
        throw new ApiClientError({
            code: 'FORBIDDEN',
            message: 'Not allowed to access this user data',
            status: 403,
        });
    }
    return 'e2e-client-1';
}

function sum(items: CalorieLogItem[], pick: (item: CalorieLogItem) => number): number {
    return Math.round(items.reduce((total, item) => total + pick(item), 0) * 100) / 100;
}

/** Mirrors the API: every day returns all five slots, empty ones included. */
function buildLog(clientUserId: string, date: string): CalorieLog {
    const items = e2eCalorieLogItems.get(`${clientUserId}:${date}`) ?? [];
    return {
        logDate: date,
        totalCalories: sum(items, (item) => item.calories),
        totalProteinG: sum(items, (item) => item.proteinG),
        totalCarbsG: sum(items, (item) => item.carbsG),
        totalFatG: sum(items, (item) => item.fatG),
        slots: MEAL_SLOTS.map((mealSlot) => {
            const slotItems = items.filter((item) => item.mealSlot === mealSlot);
            return {
                mealSlot,
                totalCalories: sum(slotItems, (item) => item.calories),
                totalProteinG: sum(slotItems, (item) => item.proteinG),
                totalCarbsG: sum(slotItems, (item) => item.carbsG),
                totalFatG: sum(slotItems, (item) => item.fatG),
                items: slotItems,
            };
        }),
    };
}

function requireCaloriesGrant(gymOrgId: string, clientUserId: string): void {
    const grants = gymOrgId === E2E_GYM_ID ? e2eStaffClientGrants.get(`${gymOrgId}:${clientUserId}`) : undefined;
    if (!grants?.classGrants.includes('CALORIES')) {
        throw new ApiClientError({
            code: 'NUTRITION_FORBIDDEN',
            message: 'CALORIES grant required to view client diary',
            status: 403,
        });
    }
}

export function createE2eNutritionAdapter(): NutritionReader & NutritionWriter {
    return {
        async searchFoods({ query }) {
            const needle = (query ?? '').trim().toLowerCase();
            if (needle.length === 0) {
                return { foods: e2eFoodCatalog };
            }
            return {
                foods: e2eFoodCatalog.filter(
                    (food) =>
                        food.name.toLowerCase().includes(needle) ||
                        food.aliases.some((alias) => alias.toLowerCase().includes(needle)),
                ),
            };
        },

        async getMyCalorieLog({ accessToken, date }) {
            const userId = clientUserIdForToken(accessToken);
            return { calorieLog: buildLog(userId, date ?? isoDateLocal()) };
        },

        async logExtraFood({ accessToken, foodItemId, servingId, quantity, mealSlot, logDate }) {
            const userId = clientUserIdForToken(accessToken);
            const date = logDate ?? isoDateLocal();
            const food = e2eFoodCatalog.find((row) => row.id === foodItemId);
            const serving = food?.units.find((unit) => unit.id === servingId);
            if (!food || !serving) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Food or serving not found', status: 404 });
            }
            if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 100) {
                throw new ApiClientError({ code: 'VALIDATION_ERROR', message: 'Invalid quantity', status: 422 });
            }

            const key = `${userId}:${date}`;
            const items = e2eCalorieLogItems.get(key) ?? [];
            const round = (value: number): number => Math.round(value * 100) / 100;
            items.push({
                id: `c${crypto.randomUUID().slice(1)}`,
                foodItemId,
                servingId,
                quantity,
                mealSlot,
                dietPlanMealItemId: null,
                calories: round(serving.calories * quantity),
                proteinG: round(serving.proteinG * quantity),
                carbsG: round(serving.carbsG * quantity),
                fatG: round(serving.fatG * quantity),
                isExtra: true,
            });
            e2eCalorieLogItems.set(key, items);
            return { calorieLog: buildLog(userId, date) };
        },

        async unlogExtraFood({ accessToken, itemId }) {
            const userId = clientUserIdForToken(accessToken);
            for (const [key, items] of e2eCalorieLogItems.entries()) {
                if (!key.startsWith(`${userId}:`)) {
                    continue;
                }
                const idx = items.findIndex((item) => item.id === itemId);
                if (idx < 0) {
                    continue;
                }
                if (!items[idx].isExtra) {
                    throw new ApiClientError({
                        code: 'INVALID_NUTRITION',
                        message: 'Plan-linked items must be uncompleted on the diet plan',
                        status: 422,
                    });
                }
                items.splice(idx, 1);
                return { calorieLog: buildLog(userId, key.slice(userId.length + 1)) };
            }
            throw new ApiClientError({ code: 'NOT_FOUND', message: 'Diary line not found', status: 404 });
        },

        async getStaffClientCalorieLog({ gymOrgId, clientUserId, date }) {
            requireCaloriesGrant(gymOrgId, clientUserId);
            return { calorieLog: buildLog(clientUserId, date ?? isoDateLocal()) };
        },
    };
}
