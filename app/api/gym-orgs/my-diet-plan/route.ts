import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { clientGymGateMessage, requireClientGym } from '@/lib/auth/client-gym-gate';
import { coachingErrorMessage } from '@/modules/coaching/coaching-errors';
import { getMyDietPlanForSession } from '@/modules/coaching/coaching-queries';

export async function GET() {
    const gate = await requireClientGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: clientGymGateMessage(gate.code) } },
            { status: gate.status },
        );
    }

    try {
        const dietPlan = await getMyDietPlanForSession({
            accessToken: gate.session.accessToken,
            gymOrgId: gate.gymOrgId,
        });
        return NextResponse.json({ dietPlan });
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
