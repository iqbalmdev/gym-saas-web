import type { MealSlot } from '@/modules/nutrition/nutrition-ports';

const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
    BREAKFAST: 'Breakfast',
    MORNING_SNACK: 'Morning snack',
    LUNCH: 'Lunch',
    EVENING_SNACK: 'Evening snack',
    DINNER: 'Dinner',
};

export function mealSlotLabel(mealSlot: MealSlot): string {
    return MEAL_SLOT_LABELS[mealSlot];
}

/** Macros arrive as fractional grams; one decimal is the most the catalog meaningfully carries. */
export function formatMacroGrams(value: number): string {
    return `${Math.round(value * 10) / 10} g`;
}

export function formatCalories(value: number): string {
    return `${Math.round(value)} kcal`;
}

/** `2` reads better than `2.00`, but `1.5 servings` must survive. */
export function formatQuantity(value: number): string {
    return String(Math.round(value * 100) / 100);
}
