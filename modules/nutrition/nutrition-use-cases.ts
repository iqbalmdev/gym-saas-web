import type { NutritionReader, NutritionWriter } from '@/modules/nutrition/nutrition-ports';

export function createSearchFoods(deps: { nutrition: NutritionReader }) {
    return async function searchFoods(input: Parameters<NutritionReader['searchFoods']>[0]) {
        return deps.nutrition.searchFoods(input);
    };
}

export function createGetMyCalorieLog(deps: { nutrition: NutritionReader }) {
    return async function getMyCalorieLog(input: Parameters<NutritionReader['getMyCalorieLog']>[0]) {
        return deps.nutrition.getMyCalorieLog(input);
    };
}

export function createGetStaffClientCalorieLog(deps: { nutrition: NutritionReader }) {
    return async function getStaffClientCalorieLog(input: Parameters<NutritionReader['getStaffClientCalorieLog']>[0]) {
        return deps.nutrition.getStaffClientCalorieLog(input);
    };
}

export function createUnlogExtraFood(deps: { nutrition: NutritionWriter }) {
    return async function unlogExtraFood(input: Parameters<NutritionWriter['unlogExtraFood']>[0]) {
        return deps.nutrition.unlogExtraFood(input);
    };
}

export function createLogExtraFood(deps: { nutrition: NutritionWriter }) {
    return async function logExtraFood(input: Parameters<NutritionWriter['logExtraFood']>[0]) {
        return deps.nutrition.logExtraFood(input);
    };
}
