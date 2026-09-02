import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import type { GrantAware } from '@/lib/domain/grant-aware';
import { isCaloriesGrantMissing } from '@/modules/nutrition/nutrition-errors';
import type { CalorieLog, FoodSearchResult } from '@/modules/nutrition/nutrition-ports';

export async function searchFoodsForSession(input: {
    accessToken: string;
    query?: string;
}): Promise<FoodSearchResult[]> {
    const { searchFoods } = createAppServices();
    const { foods } = await searchFoods({ accessToken: input.accessToken, query: input.query });
    return foods;
}

export async function getMyCalorieLogForSession(input: { accessToken: string; date?: string }): Promise<CalorieLog> {
    const { getMyCalorieLog } = createAppServices();
    const { calorieLog } = await getMyCalorieLog(input);
    return calorieLog;
}

export async function getStaffClientCalorieLogForGym(input: {
    accessToken: string;
    gymOrgId: string;
    clientUserId: string;
    date?: string;
}): Promise<GrantAware<CalorieLog>> {
    const { getStaffClientCalorieLog } = createAppServices();
    try {
        const { calorieLog } = await getStaffClientCalorieLog(input);
        return { status: 'ok', data: calorieLog };
    } catch (error) {
        if (error instanceof ApiClientError && isCaloriesGrantMissing(error.code)) {
            return { status: 'not_shared' };
        }
        throw error;
    }
}
