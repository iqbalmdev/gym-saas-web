import { z } from 'zod';

import type { HttpClient } from '@/lib/api/client';
import { endpoints } from '@/modules/health-sync/health-sync-endpoints';
import type {
    HealthSyncReader,
    HealthSyncWriter,
    WearableConnection,
    WearableMetric,
    WearableMetricsPage,
} from '@/modules/health-sync/health-sync-ports';

/** Steps and calories arrive as PG numerics, which serialize as strings — coerce at the boundary. */
const nullableNumber = z.preprocess((value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : value;
    }
    return value;
}, z.number().nullable());

const providerSchema = z.enum(['APPLE_HEALTH', 'HEALTH_CONNECT', 'SAMSUNG_HEALTH']);

const connectionSchema = z.object({
    id: z.string().min(1),
    provider: providerSchema,
    lastSyncedAt: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    active: z.coerce.boolean(),
    createdAt: z
        .string()
        .nullish()
        .transform((value) => value ?? ''),
});

const metricSchema = z.object({
    id: z.string().min(1),
    provider: providerSchema,
    metricOn: z.string().min(1),
    steps: nullableNumber,
    activeKcal: nullableNumber,
    workoutMinutes: nullableNumber,
    weightKg: nullableNumber,
    ingestedAt: z
        .string()
        .nullish()
        .transform((value) => value ?? ''),
});

const connectionEnvelopeSchema = z.object({ connection: z.unknown() });

/** Postman: `{ connections: WearableConnection[] }`. */
const connectionsEnvelopeSchema = z.object({ connections: z.array(z.unknown()) });

/**
 * Postman: `{ wearableMetrics: { items, total, limit, offset } }`.
 * Also accept a bare array, matching how the progress-logs read is hardened.
 */
const metricsEnvelopeSchema = z.object({
    wearableMetrics: z.union([
        z.object({
            items: z.array(z.unknown()),
            total: z.coerce.number(),
            limit: z.coerce.number(),
            offset: z.coerce.number(),
        }),
        z.array(z.unknown()),
    ]),
});

/** Map snake_case / alternate keys onto the Postman camelCase contract. */
function normalizeConnectionRecord(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        provider: row.provider,
        lastSyncedAt: row.lastSyncedAt ?? row.last_synced_at ?? null,
        active: row.active ?? row.is_active,
        createdAt: row.createdAt ?? row.created_at,
    };
}

function normalizeMetricRecord(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        provider: row.provider,
        metricOn: row.metricOn ?? row.metric_on,
        steps: row.steps,
        activeKcal: row.activeKcal ?? row.active_kcal,
        workoutMinutes: row.workoutMinutes ?? row.workout_minutes,
        weightKg: row.weightKg ?? row.weight_kg,
        ingestedAt: row.ingestedAt ?? row.ingested_at,
    };
}

function toConnection(raw: unknown): WearableConnection {
    const parsed = connectionSchema.parse(normalizeConnectionRecord(raw));
    return {
        id: parsed.id,
        provider: parsed.provider,
        lastSyncedAt: parsed.lastSyncedAt,
        active: parsed.active,
        createdAt: parsed.createdAt,
    };
}

function toMetric(raw: unknown): WearableMetric {
    const parsed = metricSchema.parse(normalizeMetricRecord(raw));
    return {
        id: parsed.id,
        provider: parsed.provider,
        metricOn: parsed.metricOn,
        steps: parsed.steps,
        activeKcal: parsed.activeKcal,
        workoutMinutes: parsed.workoutMinutes,
        weightKg: parsed.weightKg,
        ingestedAt: parsed.ingestedAt,
    };
}

function parseMetricsPage(raw: unknown): WearableMetricsPage {
    const envelope = metricsEnvelopeSchema.parse(raw).wearableMetrics;
    const itemsRaw = Array.isArray(envelope) ? envelope : envelope.items;
    const items = itemsRaw.map(toMetric);
    if (Array.isArray(envelope)) {
        return { items, total: items.length, limit: items.length, offset: 0 };
    }
    return { items, total: envelope.total, limit: envelope.limit, offset: envelope.offset };
}

function pageQuery(input: { limit?: number; offset?: number }): string {
    const params = new URLSearchParams();
    if (input.limit !== undefined) {
        params.set('limit', String(input.limit));
    }
    if (input.offset !== undefined) {
        params.set('offset', String(input.offset));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

export function createHealthSyncAdapter(http: HttpClient): HealthSyncReader & HealthSyncWriter {
    return {
        async listMyWearableConnections({ accessToken }) {
            const raw = await http.request<unknown>({
                path: endpoints.meWearableConnections,
                method: 'GET',
                accessToken,
            });
            return { connections: connectionsEnvelopeSchema.parse(raw).connections.map(toConnection) };
        },

        async listMyWearableMetrics({ accessToken, limit, offset }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.meWearableMetrics}${pageQuery({ limit, offset })}`,
                method: 'GET',
                accessToken,
            });
            return { wearableMetrics: parseMetricsPage(raw) };
        },

        async connectWearable({ accessToken, provider }) {
            const raw = await http.request<unknown>({
                path: endpoints.meWearableConnections,
                method: 'POST',
                accessToken,
                // Postman: prefer `authRef: null` — the phone pushes metrics, the web only registers intent.
                body: { provider, authRef: null },
            });
            return { connection: toConnection(connectionEnvelopeSchema.parse(raw).connection) };
        },

        async disconnectWearable({ accessToken, provider }) {
            const raw = await http.request<unknown>({
                path: endpoints.meWearableConnection(provider),
                method: 'DELETE',
                accessToken,
            });
            return { connection: toConnection(connectionEnvelopeSchema.parse(raw).connection) };
        },

        async listStaffClientWearableMetrics({ accessToken, gymOrgId, clientUserId, limit, offset }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.gymOrgClientWearableMetrics(gymOrgId, clientUserId)}${pageQuery({ limit, offset })}`,
                method: 'GET',
                accessToken,
            });
            return { wearableMetrics: parseMetricsPage(raw) };
        },
    };
}
