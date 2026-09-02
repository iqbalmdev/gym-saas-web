import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled } from '@/lib/api/e2e/store';
import { createHealthSyncAdapter } from '@/modules/health-sync/health-sync-adapter';
import { createE2eHealthSyncAdapter } from '@/modules/health-sync/health-sync-e2e-fixtures';
import {
    createConnectWearable,
    createDisconnectWearable,
    createListMyWearableConnections,
    createListMyWearableMetrics,
    createListStaffClientWearableMetrics,
} from '@/modules/health-sync/health-sync-use-cases';

/** Binds the health-sync port to its adapter and use-cases (ADR-0007). */
export function healthSyncServices(http: HttpClient) {
    const healthSync = areE2eFixturesEnabled() ? createE2eHealthSyncAdapter() : createHealthSyncAdapter(http);
    return {
        healthSync,
        listMyWearableConnections: createListMyWearableConnections({ healthSync }),
        listMyWearableMetrics: createListMyWearableMetrics({ healthSync }),
        listStaffClientWearableMetrics: createListStaffClientWearableMetrics({ healthSync }),
        connectWearable: createConnectWearable({ healthSync }),
        disconnectWearable: createDisconnectWearable({ healthSync }),
    };
}
