/**
 * M10 Health Sync — Postman "Health Sync" folder.
 *
 * Connections and daily metrics are Client-owned and are not gym-scoped. Staff
 * read them only through the gym-scoped endpoint, which the API refuses with
 * `HEALTH_SYNC_FORBIDDEN` unless a WEARABLES grant exists.
 */

export type WearableProvider = 'APPLE_HEALTH' | 'HEALTH_CONNECT' | 'SAMSUNG_HEALTH';

export type WearableConnection = {
    id: string;
    provider: WearableProvider;
    lastSyncedAt: string | null;
    active: boolean;
    createdAt: string;
};

export type WearableMetric = {
    id: string;
    provider: WearableProvider;
    metricOn: string;
    steps: number | null;
    activeKcal: number | null;
    workoutMinutes: number | null;
    weightKg: number | null;
    ingestedAt: string;
};

export type WearableMetricsPage = {
    items: WearableMetric[];
    total: number;
    limit: number;
    offset: number;
};

export type HealthSyncReader = {
    listMyWearableConnections: (input: { accessToken: string }) => Promise<{
        connections: WearableConnection[];
    }>;
    listMyWearableMetrics: (input: { accessToken: string; limit?: number; offset?: number }) => Promise<{
        wearableMetrics: WearableMetricsPage;
    }>;
    listStaffClientWearableMetrics: (input: {
        accessToken: string;
        gymOrgId: string;
        clientUserId: string;
        limit?: number;
        offset?: number;
    }) => Promise<{ wearableMetrics: WearableMetricsPage }>;
};

export type HealthSyncWriter = {
    connectWearable: (input: { accessToken: string; provider: WearableProvider }) => Promise<{
        connection: WearableConnection;
    }>;
    disconnectWearable: (input: { accessToken: string; provider: WearableProvider }) => Promise<{
        connection: WearableConnection;
    }>;
};
