import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireStaffGym } from '@/lib/auth/staff-gym-gate';
import { coachingErrorMessage } from '@/modules/coaching/coaching-errors';
import { listWorkoutPlanTemplatesForGym } from '@/modules/coaching/coaching-queries';

export async function GET() {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: coachingErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    try {
        const workoutPlanTemplates = await listWorkoutPlanTemplatesForGym({
            accessToken: gate.session.accessToken,
            gymOrgId: gate.gymOrgId,
        });
        return NextResponse.json({ workoutPlanTemplates });
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
