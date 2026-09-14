import { describe, expect, it } from 'vitest';

import type { HttpClient } from '@/lib/api/client';
import { createHealthSyncAdapter } from '@/modules/health-sync/health-sync-adapter';

type Recorded = { path: string; method?: string; body?: unknown };

/** Drives the real adapter so normalization and Zod parsing are what gets tested. */
function stubHttp(response: unknown): { http: HttpClient; calls: Recorded[] } {
    const calls: Recorded[] = [];
    const http: HttpClient = {
        request: async <T>(input: { path: string; method?: string; body?: unknown }): Promise<T> => {
            calls.push({ path: input.path, method: input.method, body: input.body });
            return response as T;
        },
    };
    return { http, calls };
}

describe('health-sync adapter (Postman examples)', () => {
    it('parses List My Wearable Connections', async () => {
        const { http } = stubHttp({
            connections: [
                {
                    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
                    provider: 'HEALTH_CONNECT',
                    lastSyncedAt: '2026-08-18T04:00:00.000Z',
                    active: true,
                    createdAt: '2026-08-18T04:00:00.000Z',
                },
            ],
        });

        const { connections } = await createHealthSyncAdapter(http).listMyWearableConnections({
            accessToken: 'token',
        });

        expect(connections).toHaveLength(1);
        expect(connections[0]?.provider).toBe('HEALTH_CONNECT');
        expect(connections[0]?.active).toBe(true);
    });

    it('parses List My Wearable Metrics page', async () => {
        const { http } = stubHttp({
            wearableMetrics: {
                items: [
                    {
                        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                        provider: 'HEALTH_CONNECT',
                        metricOn: '2026-08-18',
                        steps: 8420,
                        activeKcal: 410.5,
                        workoutMinutes: 45,
                        weightKg: 72.3,
                        ingestedAt: '2026-08-18T04:00:00.000Z',
                    },
                ],
                total: 1,
                limit: 20,
                offset: 0,
            },
        });

        const { wearableMetrics } = await createHealthSyncAdapter(http).listMyWearableMetrics({
            accessToken: 'token',
        });

        expect(wearableMetrics.total).toBe(1);
        expect(wearableMetrics.items[0]?.steps).toBe(8420);
        expect(wearableMetrics.items[0]?.metricOn).toBe('2026-08-18');
    });

    it('coerces PG numeric strings and snake_case keys', async () => {
        const { http } = stubHttp({
            wearableMetrics: {
                items: [
                    {
                        id: 'metric-1',
                        provider: 'HEALTH_CONNECT',
                        metric_on: '2026-08-18',
                        steps: '8420',
                        active_kcal: '410.50',
                        workout_minutes: '45',
                        weight_kg: '72.30',
                        ingested_at: '2026-08-18T04:00:00.000Z',
                    },
                ],
                total: '1',
                limit: '20',
                offset: '0',
            },
        });

        const { wearableMetrics } = await createHealthSyncAdapter(http).listMyWearableMetrics({
            accessToken: 'token',
        });

        const metric = wearableMetrics.items[0];
        expect(metric?.metricOn).toBe('2026-08-18');
        expect(metric?.steps).toBe(8420);
        expect(metric?.activeKcal).toBe(410.5);
        expect(metric?.workoutMinutes).toBe(45);
        expect(metric?.weightKg).toBe(72.3);
    });

    it('tolerates a bare array instead of a page envelope', async () => {
        const { http } = stubHttp({
            wearableMetrics: [
                {
                    id: 'metric-1',
                    provider: 'APPLE_HEALTH',
                    metricOn: '2026-08-18',
                    steps: 100,
                    activeKcal: null,
                    workoutMinutes: null,
                    weightKg: null,
                    ingestedAt: '2026-08-18T04:00:00.000Z',
                },
            ],
        });

        const { wearableMetrics } = await createHealthSyncAdapter(http).listMyWearableMetrics({
            accessToken: 'token',
        });

        expect(wearableMetrics.total).toBe(1);
        expect(wearableMetrics.items[0]?.activeKcal).toBeNull();
    });

    it('sends authRef null on Connect Wearable and targets the provider path on Disconnect', async () => {
        const connection = {
            connection: {
                id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
                provider: 'HEALTH_CONNECT',
                lastSyncedAt: null,
                active: true,
                createdAt: '2026-08-18T04:00:00.000Z',
            },
        };

        const connectStub = stubHttp(connection);
        await createHealthSyncAdapter(connectStub.http).connectWearable({
            accessToken: 'token',
            provider: 'HEALTH_CONNECT',
        });
        expect(connectStub.calls[0]?.path).toBe('/me/wearable-connections');
        expect(connectStub.calls[0]?.method).toBe('POST');
        expect(connectStub.calls[0]?.body).toEqual({ provider: 'HEALTH_CONNECT', authRef: null });

        const disconnectStub = stubHttp({ connection: { ...connection.connection, active: false } });
        const result = await createHealthSyncAdapter(disconnectStub.http).disconnectWearable({
            accessToken: 'token',
            provider: 'HEALTH_CONNECT',
        });
        expect(disconnectStub.calls[0]?.path).toBe('/me/wearable-connections/HEALTH_CONNECT');
        expect(disconnectStub.calls[0]?.method).toBe('DELETE');
        expect(result.connection.active).toBe(false);
    });

    it('paginates the staff metrics read against the gym-scoped path', async () => {
        const { http, calls } = stubHttp({
            wearableMetrics: { items: [], total: 0, limit: 20, offset: 0 },
        });

        await createHealthSyncAdapter(http).listStaffClientWearableMetrics({
            accessToken: 'token',
            gymOrgId: 'gym-1',
            clientUserId: 'client-1',
            limit: 20,
            offset: 0,
        });

        expect(calls[0]?.path).toBe('/gym-orgs/gym-1/clients/client-1/wearable-metrics?limit=20&offset=0');
    });
});
