import type { FoodSearchResult } from '@/modules/nutrition/nutrition-ports';

/** Diary lines carry `foodItemId` but no name, so the catalog is what makes a day readable. */
export type FoodNameMap = Record<string, string>;

export function toFoodNameMap(foods: FoodSearchResult[]): FoodNameMap {
    return Object.fromEntries(foods.map((food) => [food.id, food.name]));
}

export function foodNameFor(foodNames: FoodNameMap, foodItemId: string): string {
    return foodNames[foodItemId] ?? 'Catalog food';
}
