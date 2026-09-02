/** Named Gym Backend paths for M10 Health Sync — adapters only. */
export const endpoints = {
    meWearableConnections: '/me/wearable-connections',
    meWearableConnection: (provider: string) => `/me/wearable-connections/${encodeURIComponent(provider)}`,
    meWearableMetrics: '/me/wearable-metrics',
    gymOrgClientWearableMetrics: (gymOrgId: string, clientUserId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/clients/${encodeURIComponent(clientUserId)}/wearable-metrics`,
} as const;
