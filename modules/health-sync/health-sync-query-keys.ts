/** Query-key factory for M10 Health Sync (ADR-0011). */
export const healthSyncKeys = {
    all: ['health-sync'] as const,
    myConnections: () => [...healthSyncKeys.all, 'me', 'connections'] as const,
    myMetrics: () => [...healthSyncKeys.all, 'me', 'metrics'] as const,
    staffClientMetrics: (clientUserId: string) => [...healthSyncKeys.all, 'staff', clientUserId, 'metrics'] as const,
};
