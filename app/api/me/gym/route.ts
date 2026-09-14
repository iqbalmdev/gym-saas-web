import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireClientSession } from '@/lib/auth/client-gate';
import { gymOrgErrorMessage } from '@/modules/gym-orgs/gym-orgs-errors';
import { getMyGymForSession } from '@/modules/gym-orgs/gym-orgs-queries';

export async function GET() {
    const gate = await requireClientSession();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: gymOrgErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    try {
        const gymOrg = await getMyGymForSession({ accessToken: gate.session.accessToken });
        return NextResponse.json({ gymOrg });
    } catch (error) {
        if (error instanceof ApiClientError) {
            return NextResponse.json(
                { error: { code: error.code, message: gymOrgErrorMessage(error.code, error.message) } },
                { status: error.status === 0 ? 502 : error.status },
            );
        }
        return NextResponse.json(
            { error: { code: 'NETWORK_OR_UNKNOWN', message: gymOrgErrorMessage('NETWORK_OR_UNKNOWN') } },
            { status: 500 },
        );
    }
}
