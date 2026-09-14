import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled } from '@/lib/api/e2e/store';
import { createNutritionAdapter } from '@/modules/nutrition/nutrition-adapter';
import { createE2eNutritionAdapter } from '@/modules/nutrition/nutrition-e2e-fixtures';
import {
    createGetMyCalorieLog,
    createGetStaffClientCalorieLog,
    createLogExtraFood,
    createSearchFoods,
    createUnlogExtraFood,
} from '@/modules/nutrition/nutrition-use-cases';

/** Binds the nutrition port to its adapter and use-cases (ADR-0007). */
export function nutritionServices(http: HttpClient) {
    const nutrition = areE2eFixturesEnabled() ? createE2eNutritionAdapter() : createNutritionAdapter(http);
    return {
        nutrition,
        searchFoods: createSearchFoods({ nutrition }),
        getMyCalorieLog: createGetMyCalorieLog({ nutrition }),
        getStaffClientCalorieLog: createGetStaffClientCalorieLog({ nutrition }),
        logExtraFood: createLogExtraFood({ nutrition }),
        unlogExtraFood: createUnlogExtraFood({ nutrition }),
    };
}
