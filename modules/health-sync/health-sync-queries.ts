import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import type { GrantAware } from '@/lib/domain/grant-aware';
import { isWearablesGrantMissing } from '@/modules/health-sync/health-sync-errors';
import type { WearableConnection, WearableMetric } from '@/modules/health-sync/health-sync-ports';

/** Match the Postman default page size for the wearable metrics reads. */
const METRICS_PAGE_SIZE = 20;

export async function listMyWearableConnectionsForSession(input: {
    accessToken: string;
}): Promise<WearableConnection[]> {
    const { listMyWearableConnections } = createAppServices();
    const { connections } = await listMyWearableConnections({ accessToken: input.accessToken });
    return connections;
}

export async function listMyWearableMetricsForSession(input: { accessToken: string }): Promise<WearableMetric[]> {
    const { listMyWearableMetrics } = createAppServices();
    const { wearableMetrics } = await listMyWearableMetrics({
        accessToken: input.accessToken,
        limit: METRICS_PAGE_SIZE,
        offset: 0,
    });
    return wearableMetrics.items;
}

export async function listStaffClientWearableMetricsForGym(input: {
    accessToken: string;
    gymOrgId: string;
    clientUserId: string;
}): Promise<GrantAware<WearableMetric[]>> {
    const { listStaffClientWearableMetrics } = createAppServices();
    try {
        const { wearableMetrics } = await listStaffClientWearableMetrics({
            ...input,
            limit: METRICS_PAGE_SIZE,
            offset: 0,
        });
        return { status: 'ok', data: wearableMetrics.items };
    } catch (error) {
        if (error instanceof ApiClientError && isWearablesGrantMissing(error.code)) {
            return { status: 'not_shared' };
        }
        throw error;
    }
}
