import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

import { getSession, isClientSession } from '@/lib/auth/session';
import { getQueryClient } from '@/lib/query/query-client';
import { ClientWearableConnectionsPanel } from '@/modules/health-sync/components/client-wearable-connections-panel';
import { ClientWearableMetricsPanel } from '@/modules/health-sync/components/client-wearable-metrics-panel';
import { healthSyncKeys } from '@/modules/health-sync/health-sync-query-keys';
import {
    listMyWearableConnectionsForSession,
    listMyWearableMetricsForSession,
} from '@/modules/health-sync/health-sync-queries';

async function ClientHealthWorkspace({ accessToken }: { accessToken: string }) {
    const queryClient = getQueryClient();
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: healthSyncKeys.myConnections(),
            queryFn: () => listMyWearableConnectionsForSession({ accessToken }),
        }),
        queryClient.prefetchQuery({
            queryKey: healthSyncKeys.myMetrics(),
            queryFn: () => listMyWearableMetricsForSession({ accessToken }),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="space-y-6">
                <ClientWearableConnectionsPanel />
                <ClientWearableMetricsPanel />
            </div>
        </HydrationBoundary>
    );
}

export default async function ClientHealthPage() {
    const session = await getSession();
    if (!session || !isClientSession(session)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg)">Health Sync</h1>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Connect Apple Health, Health Connect, or Samsung Health. Steps, calories, and weight stay yours —
                    gyms read them only with your Wearables consent.
                </p>
            </div>

            <Suspense fallback={<ClientHealthSkeleton />}>
                <ClientHealthWorkspace accessToken={session.accessToken} />
            </Suspense>
        </div>
    );
}

function ClientHealthSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            {[0, 1].map((panel) => (
                <div
                    key={panel}
                    className="animate-pulse space-y-3 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
                >
                    <div className="h-5 w-32 rounded bg-(--color-border)" />
                    <div className="h-4 w-full max-w-md rounded bg-(--color-border)" />
                    <div className="h-9 w-28 rounded-md bg-(--color-border)" />
                </div>
            ))}
        </div>
    );
}
