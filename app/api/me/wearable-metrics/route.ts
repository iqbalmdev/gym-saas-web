import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireClientSession } from '@/lib/auth/client-gate';
import { healthSyncErrorMessage } from '@/modules/health-sync/health-sync-errors';
import { listMyWearableMetricsForSession } from '@/modules/health-sync/health-sync-queries';

export async function GET() {
    const gate = await requireClientSession();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: healthSyncErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    try {
        const wearableMetrics = await listMyWearableMetricsForSession({
            accessToken: gate.session.accessToken,
        });
        return NextResponse.json({ wearableMetrics });
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
