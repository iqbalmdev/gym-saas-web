'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { BffError, getJson } from '@/lib/query/api-fetch';
import type { GrantAware } from '@/lib/domain/grant-aware';
import {
    assignClientDietPlanAction,
    completeDietItemAction,
    completeScheduleExerciseAction,
    createDietPlanTemplateAction,
    createWorkoutPlanTemplateAction,
    deleteDietPlanTemplateAction,
    deleteWorkoutPlanTemplateAction,
    duplicateDietPlanTemplateAction,
    duplicateWorkoutPlanTemplateAction,
    uncompleteDietItemAction,
    uncompleteScheduleExerciseAction,
    upsertClientWorkoutScheduleAction,
} from '@/modules/coaching/coaching-actions';
import { coachingErrorMessage, isWorkoutPlansGrantMissing } from '@/modules/coaching/coaching-errors';
import type {
    DietPlan,
    DietPlanTemplate,
    DietPlanTemplateWriteBody,
    StaffDietPlan,
    StaffWorkoutScheduleDay,
    WorkoutPlanTemplate,
    WorkoutPlanTemplateWriteBody,
    WorkoutSchedule,
    WorkoutScheduleUpsertEntry,
    WorkoutStreak,
} from '@/modules/coaching/coaching-ports';
import { coachingKeys } from '@/modules/coaching/coaching-query-keys';

export function useMyDietPlan(initial?: DietPlan | null) {
    return useQuery({
        queryKey: coachingKeys.myDietPlan(),
        initialData: initial,
        queryFn: async () => {
            const { dietPlan } = await getJson<{ dietPlan: DietPlan | null }>(
                '/api/gym-orgs/my-diet-plan',
                coachingErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return dietPlan;
        },
    });
}

export function useMyWorkoutSchedule(from: string, to: string, initial?: WorkoutSchedule) {
    return useQuery({
        queryKey: coachingKeys.myWorkoutSchedule(from, to),
        initialData: initial,
        queryFn: async () => {
            const params = new URLSearchParams({ from, to });
            return getJson<WorkoutSchedule>(
                `/api/gym-orgs/my-workout-schedule?${params.toString()}`,
                coachingErrorMessage('NETWORK_OR_UNKNOWN'),
            );
        },
    });
}

export function useMyWorkoutStreak(initial?: WorkoutStreak) {
    return useQuery({
        queryKey: coachingKeys.myWorkoutStreak(),
        initialData: initial,
        queryFn: async () =>
            getJson<WorkoutStreak>('/api/gym-orgs/my-workout-streak', coachingErrorMessage('NETWORK_OR_UNKNOWN')),
    });
}

/**
 * Owned by the diet panel, not a row: toggling completion re-renders the whole
 * plan and a row owning the mutation would unmount with its error state.
 */
export function useToggleDietItemCompletion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: { itemId: string; logged: boolean }) => {
            const result = input.logged
                ? await uncompleteDietItemAction({ itemId: input.itemId })
                : await completeDietItemAction({ itemId: input.itemId });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: coachingKeys.all });
        },
    });
}

/** Same list-level ownership as diet — the week view re-renders after each toggle. */
export function useToggleScheduleExerciseCompletion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: { itemId: string; completed: boolean }) => {
            const result = input.completed
                ? await uncompleteScheduleExerciseAction({ itemId: input.itemId })
                : await completeScheduleExerciseAction({ itemId: input.itemId });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: coachingKeys.all });
        },
    });
}

export function useDietPlanTemplates(initial?: DietPlanTemplate[]) {
    return useQuery({
        queryKey: coachingKeys.dietTemplates(),
        initialData: initial,
        queryFn: async () => {
            const { dietPlanTemplates } = await getJson<{ dietPlanTemplates: DietPlanTemplate[] }>(
                '/api/coaching/diet-plan-templates',
                coachingErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return dietPlanTemplates;
        },
    });
}

export function useWorkoutPlanTemplates(initial?: WorkoutPlanTemplate[]) {
    return useQuery({
        queryKey: coachingKeys.workoutTemplates(),
        initialData: initial,
        queryFn: async () => {
            const { workoutPlanTemplates } = await getJson<{ workoutPlanTemplates: WorkoutPlanTemplate[] }>(
                '/api/coaching/workout-plan-templates',
                coachingErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return workoutPlanTemplates;
        },
    });
}

export function useCreateDietPlanTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: DietPlanTemplateWriteBody) => {
            const result = await createDietPlanTemplateAction({ body });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: coachingKeys.dietTemplates() });
        },
    });
}

export function useDeleteDietPlanTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const result = await deleteDietPlanTemplateAction({ templateId });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: coachingKeys.dietTemplates() });
        },
    });
}

export function useDuplicateDietPlanTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const result = await duplicateDietPlanTemplateAction({ templateId });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: coachingKeys.dietTemplates() });
        },
    });
}

export function useCreateWorkoutPlanTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: WorkoutPlanTemplateWriteBody) => {
            const result = await createWorkoutPlanTemplateAction({ body });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: coachingKeys.workoutTemplates() });
        },
    });
}

export function useDeleteWorkoutPlanTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const result = await deleteWorkoutPlanTemplateAction({ templateId });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: coachingKeys.workoutTemplates() });
        },
    });
}

export function useDuplicateWorkoutPlanTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const result = await duplicateWorkoutPlanTemplateAction({ templateId });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: coachingKeys.workoutTemplates() });
        },
    });
}

export function useStaffClientDietPlan(clientUserId: string, initial?: StaffDietPlan | null) {
    return useQuery({
        queryKey: coachingKeys.staffClientDietPlan(clientUserId),
        initialData: initial,
        queryFn: async () => {
            const { dietPlan } = await getJson<{ dietPlan: StaffDietPlan | null }>(
                `/api/gym-orgs/clients/${encodeURIComponent(clientUserId)}/diet-plans`,
                coachingErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return dietPlan;
        },
    });
}

export function useAssignClientDietPlan(clientUserId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const result = await assignClientDietPlanAction({ clientUserId, templateId });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: coachingKeys.staffClientDietPlan(clientUserId) });
        },
    });
}

export function useStaffClientWorkoutSchedule(
    clientUserId: string,
    from: string,
    to: string,
    initial?: GrantAware<StaffWorkoutScheduleDay[]>,
) {
    return useQuery({
        queryKey: coachingKeys.staffClientWorkoutSchedule(clientUserId, from, to),
        staleTime: 0,
        initialData: initial,
        queryFn: async (): Promise<GrantAware<StaffWorkoutScheduleDay[]>> => {
            try {
                const params = new URLSearchParams({ from, to });
                const body = await getJson<{ status: 'ok'; data: StaffWorkoutScheduleDay[] }>(
                    `/api/gym-orgs/clients/${encodeURIComponent(clientUserId)}/workout-schedule?${params.toString()}`,
                    coachingErrorMessage('NETWORK_OR_UNKNOWN'),
                );
                return body;
            } catch (error) {
                if (error instanceof BffError && isWorkoutPlansGrantMissing(error.code)) {
                    return { status: 'not_shared' };
                }
                throw error;
            }
        },
    });
}

export function useStaffClientWorkoutStreak(clientUserId: string, initial?: GrantAware<WorkoutStreak>) {
    return useQuery({
        queryKey: coachingKeys.staffClientWorkoutStreak(clientUserId),
        staleTime: 0,
        initialData: initial,
        queryFn: async (): Promise<GrantAware<WorkoutStreak>> => {
            try {
                const body = await getJson<{ status: 'ok'; data: WorkoutStreak }>(
                    `/api/gym-orgs/clients/${encodeURIComponent(clientUserId)}/workout-streak`,
                    coachingErrorMessage('NETWORK_OR_UNKNOWN'),
                );
                return body;
            } catch (error) {
                if (error instanceof BffError && isWorkoutPlansGrantMissing(error.code)) {
                    return { status: 'not_shared' };
                }
                throw error;
            }
        },
    });
}

export function useUpsertClientWorkoutSchedule(clientUserId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (entries: WorkoutScheduleUpsertEntry[]) => {
            const result = await upsertClientWorkoutScheduleAction({ clientUserId, entries });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({
                queryKey: [...coachingKeys.all, 'staff', clientUserId],
            });
        },
    });
}
