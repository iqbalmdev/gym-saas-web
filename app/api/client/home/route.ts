import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireClientSession } from '@/lib/auth/client-gate';
import { membershipInviteErrorMessage } from '@/modules/membership-invites/membership-invites-errors';
import { getClientHomeForSession } from '@/modules/membership-invites/membership-invites-queries';

/** Client refetch endpoint for the CLIENT member home (ADR-0011). Gate → shared query → JSON. */
export async function GET() {
    const gate = await requireClientSession();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: membershipInviteErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    try {
        const data = await getClientHomeForSession({ accessToken: gate.session.accessToken });
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof ApiClientError) {
            return NextResponse.json(
                { error: { code: error.code, message: membershipInviteErrorMessage(error.code, error.message) } },
                { status: error.status === 0 ? 502 : error.status },
            );
        }
        return NextResponse.json(
            {
                error: {
                    code: 'NETWORK_OR_UNKNOWN',
                    message: membershipInviteErrorMessage('NETWORK_OR_UNKNOWN'),
                },
            },
            { status: 500 },
        );
    }
}
