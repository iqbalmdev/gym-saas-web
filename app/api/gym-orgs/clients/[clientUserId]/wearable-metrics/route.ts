import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireStaffGym } from '@/lib/auth/staff-gym-gate';
import { healthSyncErrorMessage } from '@/modules/health-sync/health-sync-errors';
import { listStaffClientWearableMetricsForGym } from '@/modules/health-sync/health-sync-queries';

type RouteContext = { params: Promise<{ clientUserId: string }> };

export async function GET(_request: Request, context: RouteContext) {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: healthSyncErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    const { clientUserId } = await context.params;
    if (!clientUserId.trim()) {
        return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: healthSyncErrorMessage('VALIDATION_ERROR') } },
            { status: 422 },
        );
    }

    try {
        const result = await listStaffClientWearableMetricsForGym({
            accessToken: gate.session.accessToken,
            gymOrgId: gate.gymOrgId,
            clientUserId,
        });
        if (result.status === 'not_shared') {
            return NextResponse.json(
                {
                    error: {
                        code: 'HEALTH_SYNC_FORBIDDEN',
                        message: healthSyncErrorMessage('HEALTH_SYNC_FORBIDDEN'),
                    },
                },
                { status: 403 },
            );
        }
        return NextResponse.json({ wearableMetrics: result.data });
    } catch (error) {
        if (error instanceof ApiClientError) {
            return NextResponse.json(
                { error: { code: error.code, message: healthSyncErrorMessage(error.code, error.message) } },
                { status: error.status === 0 ? 502 : error.status },
            );
        }
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: healthSyncErrorMessage('VALIDATION_ERROR') } },
                { status: 502 },
            );
        }
        return NextResponse.json(
            { error: { code: 'NETWORK_OR_UNKNOWN', message: healthSyncErrorMessage('NETWORK_OR_UNKNOWN') } },
            { status: 500 },
        );
    }
}
