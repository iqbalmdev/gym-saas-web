'use server';

import { revalidatePath } from 'next/cache';

import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { clientGymGateMessage, requireClientGym } from '@/lib/auth/client-gym-gate';
import { coachingErrorMessage } from '@/modules/coaching/coaching-errors';

export type CoachingActionResult = { ok: true } | { ok: false; code: string; message: string };

function fail(error: unknown): CoachingActionResult {
    if (error instanceof ApiClientError) {
        return {
            ok: false,
            code: error.code,
            message: coachingErrorMessage(error.code, error.message),
        };
    }
    if (error instanceof Error && error.name === 'ZodError') {
        return { ok: false, code: 'VALIDATION_ERROR', message: coachingErrorMessage('VALIDATION_ERROR') };
    }
    return { ok: false, code: 'NETWORK_OR_UNKNOWN', message: coachingErrorMessage('NETWORK_OR_UNKNOWN') };
}

async function requireClientWithGym(): Promise<
    { ok: true; accessToken: string; gymOrgId: string } | { ok: false; result: CoachingActionResult }
> {
    const gate = await requireClientGym();
    if (!gate.ok) {
        return {
            ok: false,
            result: {
                ok: false,
                code: gate.code,
                message: clientGymGateMessage(gate.code),
            },
        };
    }
    return { ok: true, accessToken: gate.session.accessToken, gymOrgId: gate.gymOrgId };
}

export async function completeDietItemAction(input: { itemId: string }): Promise<CoachingActionResult> {
    const gate = await requireClientWithGym();
    if (!gate.ok) {
        return gate.result;
    }

    const itemId = input.itemId.trim();
    if (itemId.length === 0) {
        return { ok: false, code: 'VALIDATION_ERROR', message: coachingErrorMessage('VALIDATION_ERROR') };
    }

    try {
        const { completeDietItem } = createAppServices();
        await completeDietItem({ accessToken: gate.accessToken, gymOrgId: gate.gymOrgId, itemId });
        revalidatePath('/client/diet');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function uncompleteDietItemAction(input: { itemId: string }): Promise<CoachingActionResult> {
    const gate = await requireClientWithGym();
    if (!gate.ok) {
        return gate.result;
    }

    const itemId = input.itemId.trim();
    if (itemId.length === 0) {
        return { ok: false, code: 'VALIDATION_ERROR', message: coachingErrorMessage('VALIDATION_ERROR') };
    }

    try {
        const { uncompleteDietItem } = createAppServices();
        await uncompleteDietItem({ accessToken: gate.accessToken, gymOrgId: gate.gymOrgId, itemId });
        revalidatePath('/client/diet');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function completeScheduleExerciseAction(input: { itemId: string }): Promise<CoachingActionResult> {
    const gate = await requireClientWithGym();
    if (!gate.ok) {
        return gate.result;
    }

    const itemId = input.itemId.trim();
    if (itemId.length === 0) {
        return { ok: false, code: 'VALIDATION_ERROR', message: coachingErrorMessage('VALIDATION_ERROR') };
    }

    try {
        const { completeScheduleExercise } = createAppServices();
        await completeScheduleExercise({ accessToken: gate.accessToken, gymOrgId: gate.gymOrgId, itemId });
        revalidatePath('/client/workouts');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function uncompleteScheduleExerciseAction(input: { itemId: string }): Promise<CoachingActionResult> {
    const gate = await requireClientWithGym();
    if (!gate.ok) {
        return gate.result;
    }

    const itemId = input.itemId.trim();
    if (itemId.length === 0) {
        return { ok: false, code: 'VALIDATION_ERROR', message: coachingErrorMessage('VALIDATION_ERROR') };
    }

    try {
        const { uncompleteScheduleExercise } = createAppServices();
        await uncompleteScheduleExercise({ accessToken: gate.accessToken, gymOrgId: gate.gymOrgId, itemId });
        revalidatePath('/client/workouts');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}
