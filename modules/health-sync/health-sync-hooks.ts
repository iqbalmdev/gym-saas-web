'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { GrantAware } from '@/lib/domain/grant-aware';
import { BffError, getJson } from '@/lib/query/api-fetch';
import { connectWearableAction, disconnectWearableAction } from '@/modules/health-sync/health-sync-actions';
import { healthSyncErrorMessage, isWearablesGrantMissing } from '@/modules/health-sync/health-sync-errors';
import type { WearableConnection, WearableMetric, WearableProvider } from '@/modules/health-sync/health-sync-ports';
import { healthSyncKeys } from '@/modules/health-sync/health-sync-query-keys';

export function useMyWearableConnections(initial?: WearableConnection[]) {
    return useQuery({
        queryKey: healthSyncKeys.myConnections(),
        initialData: initial,
        queryFn: async () => {
            const { connections } = await getJson<{ connections: WearableConnection[] }>(
                '/api/me/wearable-connections',
                healthSyncErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return connections;
        },
    });
}

export function useMyWearableMetrics(initial?: WearableMetric[]) {
    return useQuery({
        queryKey: healthSyncKeys.myMetrics(),
        initialData: initial,
        queryFn: async () => {
            const { wearableMetrics } = await getJson<{ wearableMetrics: WearableMetric[] }>(
                '/api/me/wearable-metrics',
                healthSyncErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return wearableMetrics;
        },
    });
}

export function useStaffClientWearableMetrics(clientUserId: string, initial?: GrantAware<WearableMetric[]>) {
    return useQuery({
        queryKey: healthSyncKeys.staffClientMetrics(clientUserId),
        // Always recheck — the member may have just granted or revoked WEARABLES.
        staleTime: 0,
        initialData: initial,
        queryFn: async (): Promise<GrantAware<WearableMetric[]>> => {
            try {
                const body = await getJson<{ wearableMetrics: WearableMetric[] }>(
                    `/api/gym-orgs/clients/${encodeURIComponent(clientUserId)}/wearable-metrics`,
                    healthSyncErrorMessage('NETWORK_OR_UNKNOWN'),
                );
                return { status: 'ok', data: body.wearableMetrics };
            } catch (error) {
                if (error instanceof BffError && isWearablesGrantMissing(error.code)) {
                    return { status: 'not_shared' };
                }
                throw error;
            }
        },
    });
}

export function useConnectWearable() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (provider: WearableProvider) => {
            const result = await connectWearableAction({ provider });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: healthSyncKeys.all });
        },
    });
}

/**
 * Owned by the connections list, not a row: disconnecting re-renders the list,
 * and a row that owns the mutation would unmount with its own error state.
 */
export function useDisconnectWearable() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (provider: WearableProvider) => {
            const result = await disconnectWearableAction({ provider });
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: healthSyncKeys.all });
        },
    });
}
