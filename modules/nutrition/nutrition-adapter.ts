import { z } from 'zod';

import type { HttpClient } from '@/lib/api/client';
import { endpoints } from '@/modules/nutrition/nutrition-endpoints';
import type {
    CalorieLog,
    CalorieLogItem,
    CalorieLogSlot,
    FoodSearchResult,
    FoodServing,
    NutritionReader,
    NutritionWriter,
} from '@/modules/nutrition/nutrition-ports';

/** Macros are PG numerics, which serialize as strings — coerce at the boundary. */
const numberish = z.preprocess((value) => {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : value;
    }
    return value;
}, z.number());

const mealSlotSchema = z.enum(['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'EVENING_SNACK', 'DINNER']);
const servingUnitSchema = z.enum(['G', 'ML', 'PIECE', 'KATORI', 'CUP', 'GLASS', 'TBSP', 'TSP']);

const servingSchema = z.object({
    id: z.string().min(1),
    unit: servingUnitSchema,
    label: z.string().min(1),
    grams: numberish,
    calories: numberish,
    proteinG: numberish,
    carbsG: numberish,
    fatG: numberish,
    isDefault: z.coerce.boolean(),
});

const foodSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    aliases: z
        .array(z.string())
        .nullish()
        .transform((value) => value ?? []),
    caloriesPer100g: numberish,
    proteinGPer100g: numberish,
    carbsGPer100g: numberish,
    fatGPer100g: numberish,
    defaultUnit: servingUnitSchema,
    units: z.array(z.unknown()),
});

const calorieLogItemSchema = z.object({
    id: z.string().min(1),
    foodItemId: z.string().min(1),
    servingId: z.string().min(1),
    quantity: numberish,
    mealSlot: mealSlotSchema,
    dietPlanMealItemId: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    calories: numberish,
    proteinG: numberish,
    carbsG: numberish,
    fatG: numberish,
    isExtra: z.coerce.boolean(),
});

const calorieLogSlotSchema = z.object({
    mealSlot: mealSlotSchema,
    totalCalories: numberish,
    totalProteinG: numberish,
    totalCarbsG: numberish,
    totalFatG: numberish,
    items: z.array(z.unknown()),
});

const calorieLogSchema = z.object({
    logDate: z.string().min(1),
    totalCalories: numberish,
    totalProteinG: numberish,
    totalCarbsG: numberish,
    totalFatG: numberish,
    slots: z.array(z.unknown()),
});

const foodsEnvelopeSchema = z.object({ foods: z.array(z.unknown()) });
const calorieLogEnvelopeSchema = z.object({ calorieLog: z.unknown() });

/** Map snake_case / alternate keys onto the Postman camelCase contract. */
function normalizeServing(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        unit: row.unit,
        label: row.label,
        grams: row.grams,
        calories: row.calories,
        proteinG: row.proteinG ?? row.protein_g,
        carbsG: row.carbsG ?? row.carbs_g,
        fatG: row.fatG ?? row.fat_g,
        isDefault: row.isDefault ?? row.is_default ?? false,
    };
}

function normalizeFood(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        name: row.name,
        aliases: row.aliases,
        caloriesPer100g: row.caloriesPer100g ?? row.calories_per_100g,
        proteinGPer100g: row.proteinGPer100g ?? row.protein_g_per_100g,
        carbsGPer100g: row.carbsGPer100g ?? row.carbs_g_per_100g,
        fatGPer100g: row.fatGPer100g ?? row.fat_g_per_100g,
        defaultUnit: row.defaultUnit ?? row.default_unit,
        units: row.units ?? [],
    };
}

function normalizeItem(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        foodItemId: row.foodItemId ?? row.food_item_id,
        servingId: row.servingId ?? row.serving_id,
        quantity: row.quantity,
        mealSlot: row.mealSlot ?? row.meal_slot,
        dietPlanMealItemId: row.dietPlanMealItemId ?? row.diet_plan_meal_item_id ?? null,
        calories: row.calories,
        proteinG: row.proteinG ?? row.protein_g,
        carbsG: row.carbsG ?? row.carbs_g,
        fatG: row.fatG ?? row.fat_g,
        // Postman defines isExtra as "dietPlanMealItemId is null" — derive it when the key is absent.
        isExtra: row.isExtra ?? row.is_extra ?? (row.dietPlanMealItemId ?? row.diet_plan_meal_item_id) == null,
    };
}

function normalizeSlot(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        mealSlot: row.mealSlot ?? row.meal_slot,
        totalCalories: row.totalCalories ?? row.total_calories,
        totalProteinG: row.totalProteinG ?? row.total_protein_g,
        totalCarbsG: row.totalCarbsG ?? row.total_carbs_g,
        totalFatG: row.totalFatG ?? row.total_fat_g,
        items: row.items ?? [],
    };
}

function normalizeLog(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        logDate: row.logDate ?? row.log_date,
        totalCalories: row.totalCalories ?? row.total_calories,
        totalProteinG: row.totalProteinG ?? row.total_protein_g,
        totalCarbsG: row.totalCarbsG ?? row.total_carbs_g,
        totalFatG: row.totalFatG ?? row.total_fat_g,
        slots: row.slots ?? [],
    };
}

function toServing(raw: unknown): FoodServing {
    const parsed = servingSchema.parse(normalizeServing(raw));
    return {
        id: parsed.id,
        unit: parsed.unit,
        label: parsed.label,
        grams: parsed.grams,
        calories: parsed.calories,
        proteinG: parsed.proteinG,
        carbsG: parsed.carbsG,
        fatG: parsed.fatG,
        isDefault: parsed.isDefault,
    };
}

function toFood(raw: unknown): FoodSearchResult {
    const parsed = foodSchema.parse(normalizeFood(raw));
    return {
        id: parsed.id,
        name: parsed.name,
        aliases: parsed.aliases,
        caloriesPer100g: parsed.caloriesPer100g,
        proteinGPer100g: parsed.proteinGPer100g,
        carbsGPer100g: parsed.carbsGPer100g,
        fatGPer100g: parsed.fatGPer100g,
        defaultUnit: parsed.defaultUnit,
        units: parsed.units.map(toServing),
    };
}

function toItem(raw: unknown): CalorieLogItem {
    const parsed = calorieLogItemSchema.parse(normalizeItem(raw));
    return {
        id: parsed.id,
        foodItemId: parsed.foodItemId,
        servingId: parsed.servingId,
        quantity: parsed.quantity,
        mealSlot: parsed.mealSlot,
        dietPlanMealItemId: parsed.dietPlanMealItemId,
        calories: parsed.calories,
        proteinG: parsed.proteinG,
        carbsG: parsed.carbsG,
        fatG: parsed.fatG,
        isExtra: parsed.isExtra,
    };
}

function toSlot(raw: unknown): CalorieLogSlot {
    const parsed = calorieLogSlotSchema.parse(normalizeSlot(raw));
    return {
        mealSlot: parsed.mealSlot,
        totalCalories: parsed.totalCalories,
        totalProteinG: parsed.totalProteinG,
        totalCarbsG: parsed.totalCarbsG,
        totalFatG: parsed.totalFatG,
        items: parsed.items.map(toItem),
    };
}

function toCalorieLog(raw: unknown): CalorieLog {
    const parsed = calorieLogSchema.parse(normalizeLog(raw));
    return {
        logDate: parsed.logDate,
        totalCalories: parsed.totalCalories,
        totalProteinG: parsed.totalProteinG,
        totalCarbsG: parsed.totalCarbsG,
        totalFatG: parsed.totalFatG,
        slots: parsed.slots.map(toSlot),
    };
}

function dateQuery(date?: string): string {
    return date ? `?date=${encodeURIComponent(date)}` : '';
}

export function createNutritionAdapter(http: HttpClient): NutritionReader & NutritionWriter {
    return {
        async searchFoods({ accessToken, query }) {
            // Postman: an empty `q` returns the full seed catalog, which is how the diary resolves food names.
            const raw = await http.request<unknown>({
                path: `${endpoints.foodsSearch}?q=${encodeURIComponent(query ?? '')}`,
                method: 'GET',
                accessToken,
            });
            return { foods: foodsEnvelopeSchema.parse(raw).foods.map(toFood) };
        },

        async getMyCalorieLog({ accessToken, date }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.meCalorieLogs}${dateQuery(date)}`,
                method: 'GET',
                accessToken,
            });
            return { calorieLog: toCalorieLog(calorieLogEnvelopeSchema.parse(raw).calorieLog) };
        },

        async logExtraFood({ accessToken, foodItemId, servingId, quantity, mealSlot, logDate }) {
            const raw = await http.request<unknown>({
                path: endpoints.meCalorieLogItems,
                method: 'POST',
                accessToken,
                body: {
                    foodItemId,
                    servingId,
                    quantity,
                    mealSlot,
                    ...(logDate ? { logDate } : {}),
                },
            });
            return { calorieLog: toCalorieLog(calorieLogEnvelopeSchema.parse(raw).calorieLog) };
        },

        async unlogExtraFood({ accessToken, itemId }) {
            const raw = await http.request<unknown>({
                path: endpoints.meCalorieLogItem(itemId),
                method: 'DELETE',
                accessToken,
            });
            return { calorieLog: toCalorieLog(calorieLogEnvelopeSchema.parse(raw).calorieLog) };
        },

        async getStaffClientCalorieLog({ accessToken, gymOrgId, clientUserId, date }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.gymOrgClientCalorieLogs(gymOrgId, clientUserId)}${dateQuery(date)}`,
                method: 'GET',
                accessToken,
            });
            return { calorieLog: toCalorieLog(calorieLogEnvelopeSchema.parse(raw).calorieLog) };
        },
    };
}
