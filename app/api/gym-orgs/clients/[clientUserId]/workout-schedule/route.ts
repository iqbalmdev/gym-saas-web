import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireStaffGym } from '@/lib/auth/staff-gym-gate';
import { coachingErrorMessage } from '@/modules/coaching/coaching-errors';
import { getStaffClientWorkoutScheduleForGym } from '@/modules/coaching/coaching-queries';

type RouteContext = { params: Promise<{ clientUserId: string }> };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request, context: RouteContext) {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: coachingErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    const { clientUserId } = await context.params;
    const from = new URL(request.url).searchParams.get('from');
    const to = new URL(request.url).searchParams.get('to');
    if (!clientUserId.trim() || !from || !to || !ISO_DATE.test(from) || !ISO_DATE.test(to)) {
        return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: coachingErrorMessage('VALIDATION_ERROR') } },
            { status: 422 },
        );
    }

    try {
        const result = await getStaffClientWorkoutScheduleForGym({
            accessToken: gate.session.accessToken,
            gymOrgId: gate.gymOrgId,
            clientUserId,
            from,
            to,
        });
        if (result.status === 'not_shared') {
            return NextResponse.json(
                { error: { code: 'COACHING_FORBIDDEN', message: coachingErrorMessage('COACHING_FORBIDDEN') } },
                { status: 403 },
            );
        }
        return NextResponse.json(result);
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
