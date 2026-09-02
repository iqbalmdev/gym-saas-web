import type { HealthSyncReader, HealthSyncWriter } from '@/modules/health-sync/health-sync-ports';

export function createListMyWearableConnections(deps: { healthSync: HealthSyncReader }) {
    return async function listMyWearableConnections(
        input: Parameters<HealthSyncReader['listMyWearableConnections']>[0],
    ) {
        return deps.healthSync.listMyWearableConnections(input);
    };
}

export function createListMyWearableMetrics(deps: { healthSync: HealthSyncReader }) {
    return async function listMyWearableMetrics(input: Parameters<HealthSyncReader['listMyWearableMetrics']>[0]) {
        return deps.healthSync.listMyWearableMetrics(input);
    };
}

export function createListStaffClientWearableMetrics(deps: { healthSync: HealthSyncReader }) {
    return async function listStaffClientWearableMetrics(
        input: Parameters<HealthSyncReader['listStaffClientWearableMetrics']>[0],
    ) {
        return deps.healthSync.listStaffClientWearableMetrics(input);
    };
}

export function createConnectWearable(deps: { healthSync: HealthSyncWriter }) {
    return async function connectWearable(input: Parameters<HealthSyncWriter['connectWearable']>[0]) {
        return deps.healthSync.connectWearable(input);
    };
}

export function createDisconnectWearable(deps: { healthSync: HealthSyncWriter }) {
    return async function disconnectWearable(input: Parameters<HealthSyncWriter['disconnectWearable']>[0]) {
        return deps.healthSync.disconnectWearable(input);
    };
}
