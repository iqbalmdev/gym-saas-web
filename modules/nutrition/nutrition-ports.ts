/**
 * M9 Nutrition — Postman "Nutrition" folder.
 *
 * The daily diary is Client-owned. Staff read it only through the gym-scoped
 * endpoint, which the API refuses with `NUTRITION_FORBIDDEN` unless a CALORIES
 * grant exists.
 */

export type MealSlot = 'BREAKFAST' | 'MORNING_SNACK' | 'LUNCH' | 'EVENING_SNACK' | 'DINNER';

export type ServingUnit = 'G' | 'ML' | 'PIECE' | 'KATORI' | 'CUP' | 'GLASS' | 'TBSP' | 'TSP';

/** Macros for a quantity of 1 of this serving. The API sends the same eight units on every food. */
export type FoodServing = {
    unit: ServingUnit;
    label: string;
    grams: number;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isDefault: boolean;
};

export type FoodSearchResult = {
    id: string;
    name: string;
    aliases: string[];
    caloriesPer100g: number;
    proteinGPer100g: number;
    carbsGPer100g: number;
    fatGPer100g: number;
    defaultUnit: ServingUnit;
    units: FoodServing[];
};

export type CalorieLogItem = {
    id: string;
    foodItemId: string;
    servingId: string;
    quantity: number;
    mealSlot: MealSlot;
    /** Set when the line came from completing a diet plan item; null for off-plan extras. */
    dietPlanMealItemId: string | null;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isExtra: boolean;
};

export type CalorieLogSlot = {
    mealSlot: MealSlot;
    totalCalories: number;
    totalProteinG: number;
    totalCarbsG: number;
    totalFatG: number;
    items: CalorieLogItem[];
};

/** An empty day still returns zero totals and all five meal slots. */
export type CalorieLog = {
    logDate: string;
    totalCalories: number;
    totalProteinG: number;
    totalCarbsG: number;
    totalFatG: number;
    slots: CalorieLogSlot[];
};

export type NutritionReader = {
    searchFoods: (input: { accessToken: string; query?: string }) => Promise<{ foods: FoodSearchResult[] }>;
    getMyCalorieLog: (input: { accessToken: string; date?: string }) => Promise<{ calorieLog: CalorieLog }>;
    getStaffClientCalorieLog: (input: {
        accessToken: string;
        gymOrgId: string;
        clientUserId: string;
        date?: string;
    }) => Promise<{ calorieLog: CalorieLog }>;
};

export type NutritionWriter = {
    /** Extras only — plan-linked lines answer 422 and must be uncompleted on the diet plan. */
    unlogExtraFood: (input: { accessToken: string; itemId: string }) => Promise<{ calorieLog: CalorieLog }>;
};
