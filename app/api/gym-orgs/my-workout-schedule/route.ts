import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { clientGymGateMessage, requireClientGym } from '@/lib/auth/client-gym-gate';
import { coachingErrorMessage } from '@/modules/coaching/coaching-errors';
import { getMyWorkoutScheduleForSession } from '@/modules/coaching/coaching-queries';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
    const gate = await requireClientGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: clientGymGateMessage(gate.code) } },
            { status: gate.status },
        );
    }

    const params = new URL(request.url).searchParams;
    const from = params.get('from');
    const to = params.get('to');
    if (!from || !to || !ISO_DATE.test(from) || !ISO_DATE.test(to)) {
        return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: coachingErrorMessage('VALIDATION_ERROR') } },
            { status: 422 },
        );
    }

    try {
        const schedule = await getMyWorkoutScheduleForSession({
            accessToken: gate.session.accessToken,
            gymOrgId: gate.gymOrgId,
            from,
            to,
        });
        return NextResponse.json(schedule);
    } catch (error) {
        if (error instanceof ApiClientError) {
            return NextResponse.json(
                { error: { code: error.code, message: coachingErrorMessage(error.code, error.message) } },
                { status: error.status === 0 ? 502 : error.status },
            );
        }
        return NextResponse.json(
            { error: { code: 'NETWORK_OR_UNKNOWN', message: coachingErrorMessage('NETWORK_OR_UNKNOWN') } },
            { status: 500 },
        );
    }
}
