/**
 * Playwright fixture adapter for M10 Health Sync (`GYM_SAAS_E2E_FIXTURES=1`).
 */
import { ApiClientError } from '@/lib/api/errors';
import {
    E2E_CLIENT_TOKEN,
    E2E_GYM_ID,
    e2eStaffClientGrants,
    e2eWearableConnections,
    e2eWearableMetrics,
} from '@/lib/api/e2e/store';
import type {
    HealthSyncReader,
    HealthSyncWriter,
    WearableConnection,
    WearableProvider,
} from '@/modules/health-sync/health-sync-ports';

function clientUserIdForToken(accessToken: string): string {
    if (accessToken !== E2E_CLIENT_TOKEN) {
        throw new ApiClientError({
            code: 'FORBIDDEN',
            message: 'Not allowed to access this user data',
            status: 403,
        });
    }
    return 'e2e-client-1';
}

function connectionsFor(userId: string): WearableConnection[] {
    const existing = e2eWearableConnections.get(userId);
    if (existing) {
        return existing;
    }
    const created: WearableConnection[] = [];
    e2eWearableConnections.set(userId, created);
    return created;
}

function requireWearablesGrant(gymOrgId: string, clientUserId: string): void {
    const grants = gymOrgId === E2E_GYM_ID ? e2eStaffClientGrants.get(`${gymOrgId}:${clientUserId}`) : undefined;
    if (!grants?.classGrants.includes('WEARABLES')) {
        throw new ApiClientError({
            code: 'HEALTH_SYNC_FORBIDDEN',
            message: 'WEARABLES grant required to view client wearable metrics',
            status: 403,
        });
    }
}

export function createE2eHealthSyncAdapter(): HealthSyncReader & HealthSyncWriter {
    return {
        async listMyWearableConnections({ accessToken }) {
            return { connections: connectionsFor(clientUserIdForToken(accessToken)) };
        },

        async listMyWearableMetrics({ accessToken, limit = 20, offset = 0 }) {
            const userId = clientUserIdForToken(accessToken);
            const items = e2eWearableMetrics.get(userId) ?? [];
            return {
                wearableMetrics: {
                    items: items.slice(offset, offset + limit),
                    total: items.length,
                    limit,
                    offset,
                },
            };
        },

        async connectWearable({ accessToken, provider }) {
            const userId = clientUserIdForToken(accessToken);
            const connections = connectionsFor(userId);
            const live = connections.find((item) => item.provider === provider && item.active);
            if (live) {
                throw new ApiClientError({
                    code: 'UNIQUE_VIOLATION',
                    message: 'wearable connection already exists',
                    status: 409,
                });
            }
            const connection: WearableConnection = {
                id: `wearable-conn-e2e-${provider.toLowerCase()}`,
                provider,
                lastSyncedAt: null,
                active: true,
                createdAt: '2026-08-19T12:00:00.000Z',
            };
            const idx = connections.findIndex((item) => item.provider === provider);
            if (idx >= 0) {
                connections[idx] = connection;
            } else {
                connections.push(connection);
            }
            return { connection };
        },

        async disconnectWearable({ accessToken, provider }) {
            const userId = clientUserIdForToken(accessToken);
            const connections = connectionsFor(userId);
            const idx = connections.findIndex((item) => item.provider === (provider as WearableProvider));
            if (idx < 0) {
                throw new ApiClientError({
                    code: 'NOT_FOUND',
                    message: 'Wearable connection not found',
                    status: 404,
                });
            }
            const connection: WearableConnection = { ...connections[idx], active: false };
            connections[idx] = connection;
            return { connection };
        },

        async listStaffClientWearableMetrics({ gymOrgId, clientUserId, limit = 20, offset = 0 }) {
            requireWearablesGrant(gymOrgId, clientUserId);
            const items = e2eWearableMetrics.get(clientUserId) ?? [];
            return {
                wearableMetrics: {
                    items: items.slice(offset, offset + limit),
                    total: items.length,
                    limit,
                    offset,
                },
            };
        },
    };
}
