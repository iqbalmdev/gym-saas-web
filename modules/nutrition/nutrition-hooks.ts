'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { GrantAware } from '@/lib/domain/grant-aware';
import { BffError, getJson } from '@/lib/query/api-fetch';
import { logExtraFoodAction, unlogExtraFoodAction } from '@/modules/nutrition/nutrition-actions';
import type { MealSlot } from '@/modules/nutrition/nutrition-ports';
import { isCaloriesGrantMissing, nutritionErrorMessage } from '@/modules/nutrition/nutrition-errors';
import type { CalorieLog, FoodSearchResult } from '@/modules/nutrition/nutrition-ports';
import { nutritionKeys } from '@/modules/nutrition/nutrition-query-keys';

function dateParam(date?: string): string {
    return date ? `?date=${encodeURIComponent(date)}` : '';
}

export function useMyCalorieLog(date?: string, initial?: CalorieLog) {
    return useQuery({
        queryKey: nutritionKeys.myLog(date),
        initialData: initial,
        queryFn: async () => {
            const { calorieLog } = await getJson<{ calorieLog: CalorieLog }>(
                `/api/me/calorie-logs${dateParam(date)}`,
                nutritionErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return calorieLog;
        },
    });
}

export function useFoodSearch(query: string, initial?: FoodSearchResult[]) {
    return useQuery({
        queryKey: nutritionKeys.foods(query),
        initialData: query === '' ? initial : undefined,
        // Keep the previous matches on screen while the next query resolves.
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const { foods } = await getJson<{ foods: FoodSearchResult[] }>(
                `/api/foods/search?q=${encodeURIComponent(query)}`,
                nutritionErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return foods;
        },
    });
}

export function useStaffClientCalorieLog(clientUserId: string, date?: string, initial?: GrantAware<CalorieLog>) {
    return useQuery({
        queryKey: nutritionKeys.staffClientLog(clientUserId, date),
        // Always recheck — the member may have just granted or revoked CALORIES.
        staleTime: 0,
        initialData: initial,
        queryFn: async (): Promise<GrantAware<CalorieLog>> => {
            try {
                const body = await getJson<{ calorieLog: CalorieLog }>(
                    `/api/gym-orgs/clients/${encodeURIComponent(clientUserId)}/calorie-logs${dateParam(date)}`,
                    nutritionErrorMessage('NETWORK_OR_UNKNOWN'),
                );
                return { status: 'ok', data: body.calorieLog };
            } catch (error) {
                if (error instanceof BffError && isCaloriesGrantMissing(error.code)) {
                    return { status: 'not_shared' };
                }
                throw error;
            }
        },
    });
}

/**
 * Owned by the diary, not by a slot row: removing a line re-renders the whole
 * day (slot and day totals both move), and a row owning the mutation would
 * unmount with its own error state.
 */
export function useUnlogExtraFood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (itemId: string) => {
            const result = await unlogExtraFoodAction({ itemId });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: nutritionKeys.all });
        },
    });
}

export function useLogExtraFood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: { foodItemId: string; servingId: string; quantity: number; mealSlot: MealSlot }) => {
            const result = await logExtraFoodAction({
                foodItemId: input.foodItemId,
                servingId: input.servingId,
                quantity: String(input.quantity),
                mealSlot: input.mealSlot,
            });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: nutritionKeys.all });
        },
    });
}
