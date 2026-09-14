'use server';

import { revalidatePath } from 'next/cache';

import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { getSession } from '@/lib/auth/session';
import { nutritionErrorMessage } from '@/modules/nutrition/nutrition-errors';
import type { MealSlot } from '@/modules/nutrition/nutrition-ports';

export type NutritionActionResult = { ok: true } | { ok: false; code: string; message: string };

function fail(error: unknown): NutritionActionResult {
    if (error instanceof ApiClientError) {
        return { ok: false, code: error.code, message: nutritionErrorMessage(error.code, error.message) };
    }
    if (error instanceof Error && error.name === 'ZodError') {
        return { ok: false, code: 'VALIDATION_ERROR', message: nutritionErrorMessage('VALIDATION_ERROR') };
    }
    return { ok: false, code: 'NETWORK_OR_UNKNOWN', message: nutritionErrorMessage('NETWORK_OR_UNKNOWN') };
}

async function requireClient(): Promise<
    { ok: true; accessToken: string } | { ok: false; result: NutritionActionResult }
> {
    const session = await getSession();
    if (!session || session.lane !== 'CLIENT') {
        return {
            ok: false,
            result: {
                ok: false,
                code: 'AUTHENTICATION_FAILED',
                message: nutritionErrorMessage('AUTHENTICATION_FAILED'),
            },
        };
    }
    return { ok: true, accessToken: session.accessToken };
}

const MEAL_SLOTS = new Set<MealSlot>(['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'EVENING_SNACK', 'DINNER']);

function parseMealSlot(raw: string): MealSlot | null {
    const trimmed = raw.trim();
    return MEAL_SLOTS.has(trimmed as MealSlot) ? (trimmed as MealSlot) : null;
}

export async function logExtraFoodAction(input: {
    foodItemId: string;
    servingId: string;
    quantity: string;
    mealSlot: string;
}): Promise<NutritionActionResult> {
    const gate = await requireClient();
    if (!gate.ok) {
        return gate.result;
    }

    const foodItemId = input.foodItemId.trim();
    const servingId = input.servingId.trim();
    const mealSlot = parseMealSlot(input.mealSlot);
    const quantity = Number(input.quantity);
    if (!foodItemId || !servingId || !mealSlot || !Number.isFinite(quantity) || quantity <= 0 || quantity > 100) {
        return { ok: false, code: 'VALIDATION_ERROR', message: nutritionErrorMessage('VALIDATION_ERROR') };
    }

    try {
        const { logExtraFood } = createAppServices();
        await logExtraFood({
            accessToken: gate.accessToken,
            foodItemId,
            servingId,
            quantity,
            mealSlot,
        });
        revalidatePath('/client/nutrition');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function unlogExtraFoodAction(input: { itemId: string }): Promise<NutritionActionResult> {
    const gate = await requireClient();
    if (!gate.ok) {
        return gate.result;
    }

    const itemId = input.itemId.trim();
    if (itemId.length === 0) {
        return { ok: false, code: 'VALIDATION_ERROR', message: nutritionErrorMessage('VALIDATION_ERROR') };
    }

    try {
        const { unlogExtraFood } = createAppServices();
        await unlogExtraFood({ accessToken: gate.accessToken, itemId });
        revalidatePath('/client/nutrition');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}
