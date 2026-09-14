'use server';

import { revalidatePath } from 'next/cache';

import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { clientGymGateMessage, requireClientGym } from '@/lib/auth/client-gym-gate';
import { getSession } from '@/lib/auth/session';
import { coachingErrorMessage } from '@/modules/coaching/coaching-errors';
import type {
    DietPlanTemplateWriteBody,
    WorkoutPlanTemplateWriteBody,
    WorkoutScheduleKind,
    WorkoutScheduleUpsertEntry,
} from '@/modules/coaching/coaching-ports';

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

async function requireStaffGym(): Promise<
    { ok: true; accessToken: string; gymOrgId: string } | { ok: false; result: CoachingActionResult }
> {
    const session = await getSession();
    if (!session || session.lane !== 'STAFF') {
        return {
            ok: false,
            result: {
                ok: false,
                code: 'AUTHENTICATION_FAILED',
                message: coachingErrorMessage('AUTHENTICATION_FAILED'),
            },
        };
    }
    const { listGymOrgs } = createAppServices();
    const { gymOrgs } = await listGymOrgs({ accessToken: session.accessToken });
    const gymOrgId = gymOrgs[0]?.id;
    if (!gymOrgId) {
        return {
            ok: false,
            result: {
                ok: false,
                code: 'FORBIDDEN',
                message: coachingErrorMessage('FORBIDDEN'),
            },
        };
    }
    return { ok: true, accessToken: session.accessToken, gymOrgId };
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

export async function createDietPlanTemplateAction(input: {
    body: DietPlanTemplateWriteBody;
}): Promise<CoachingActionResult> {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return gate.result;
    }
    try {
        const { createDietPlanTemplate } = createAppServices();
        await createDietPlanTemplate({ accessToken: gate.accessToken, gymOrgId: gate.gymOrgId, body: input.body });
        revalidatePath('/admin/coaching/diet-templates');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function deleteDietPlanTemplateAction(input: { templateId: string }): Promise<CoachingActionResult> {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return gate.result;
    }
    try {
        const { deleteDietPlanTemplate } = createAppServices();
        await deleteDietPlanTemplate({
            accessToken: gate.accessToken,
            gymOrgId: gate.gymOrgId,
            templateId: input.templateId,
        });
        revalidatePath('/admin/coaching/diet-templates');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function duplicateDietPlanTemplateAction(input: { templateId: string }): Promise<CoachingActionResult> {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return gate.result;
    }
    try {
        const { duplicateDietPlanTemplate } = createAppServices();
        await duplicateDietPlanTemplate({
            accessToken: gate.accessToken,
            gymOrgId: gate.gymOrgId,
            templateId: input.templateId,
        });
        revalidatePath('/admin/coaching/diet-templates');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function createWorkoutPlanTemplateAction(input: {
    body: WorkoutPlanTemplateWriteBody;
}): Promise<CoachingActionResult> {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return gate.result;
    }
    try {
        const { createWorkoutPlanTemplate } = createAppServices();
        await createWorkoutPlanTemplate({ accessToken: gate.accessToken, gymOrgId: gate.gymOrgId, body: input.body });
        revalidatePath('/admin/coaching/workout-templates');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function deleteWorkoutPlanTemplateAction(input: { templateId: string }): Promise<CoachingActionResult> {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return gate.result;
    }
    try {
        const { deleteWorkoutPlanTemplate } = createAppServices();
        await deleteWorkoutPlanTemplate({
            accessToken: gate.accessToken,
            gymOrgId: gate.gymOrgId,
            templateId: input.templateId,
        });
        revalidatePath('/admin/coaching/workout-templates');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function duplicateWorkoutPlanTemplateAction(input: { templateId: string }): Promise<CoachingActionResult> {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return gate.result;
    }
    try {
        const { duplicateWorkoutPlanTemplate } = createAppServices();
        await duplicateWorkoutPlanTemplate({
            accessToken: gate.accessToken,
            gymOrgId: gate.gymOrgId,
            templateId: input.templateId,
        });
        revalidatePath('/admin/coaching/workout-templates');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function assignClientDietPlanAction(input: {
    clientUserId: string;
    templateId: string;
}): Promise<CoachingActionResult> {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return gate.result;
    }
    const clientUserId = input.clientUserId.trim();
    const templateId = input.templateId.trim();
    if (!clientUserId || !templateId) {
        return { ok: false, code: 'VALIDATION_ERROR', message: coachingErrorMessage('VALIDATION_ERROR') };
    }
    try {
        const { assignClientDietPlanFromTemplate } = createAppServices();
        await assignClientDietPlanFromTemplate({
            accessToken: gate.accessToken,
            gymOrgId: gate.gymOrgId,
            clientUserId,
            templateId,
        });
        revalidatePath(`/admin/members/${clientUserId}`);
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

function isScheduleKind(value: string): value is WorkoutScheduleKind {
    return value === 'REST' || value === 'TRAINING';
}

export async function upsertClientWorkoutScheduleAction(input: {
    clientUserId: string;
    entries: WorkoutScheduleUpsertEntry[];
}): Promise<CoachingActionResult> {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return gate.result;
    }
    const clientUserId = input.clientUserId.trim();
    if (!clientUserId || input.entries.length === 0) {
        return { ok: false, code: 'VALIDATION_ERROR', message: coachingErrorMessage('VALIDATION_ERROR') };
    }
    for (const entry of input.entries) {
        if (!isScheduleKind(entry.kind)) {
            return { ok: false, code: 'VALIDATION_ERROR', message: coachingErrorMessage('VALIDATION_ERROR') };
        }
    }
    try {
        const { upsertClientWorkoutSchedule } = createAppServices();
        await upsertClientWorkoutSchedule({
            accessToken: gate.accessToken,
            gymOrgId: gate.gymOrgId,
            clientUserId,
            entries: input.entries,
        });
        revalidatePath(`/admin/members/${clientUserId}`);
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}
