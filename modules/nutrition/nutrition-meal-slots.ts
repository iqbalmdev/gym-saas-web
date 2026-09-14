import type { MealSlot } from '@/modules/nutrition/nutrition-ports';

/** The five meal windows, in the order the API returns them and the diary reads. */
export const MEAL_SLOTS: MealSlot[] = ['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'EVENING_SNACK', 'DINNER'];
