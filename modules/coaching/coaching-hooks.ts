'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getJson } from '@/lib/query/api-fetch';
import {
    completeDietItemAction,
    completeScheduleExerciseAction,
    uncompleteDietItemAction,
    uncompleteScheduleExerciseAction,
} from '@/modules/coaching/coaching-actions';
import { coachingErrorMessage } from '@/modules/coaching/coaching-errors';
import type { DietPlan, WorkoutSchedule, WorkoutStreak } from '@/modules/coaching/coaching-ports';
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
