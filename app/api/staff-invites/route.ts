import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireStaffGym } from '@/lib/auth/staff-gym-gate';
import { staffInviteErrorMessage } from '@/modules/staff-invites/staff-invites-errors';
import { listGymStaffInvitesForGym } from '@/modules/staff-invites/staff-invites-queries';

/** Client refetch endpoint for a gym's staff invites (ADR-0011). Gate → shared query → JSON. */
export async function GET() {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: staffInviteErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    try {
        const invites = await listGymStaffInvitesForGym({
            accessToken: gate.session.accessToken,
            gymOrgId: gate.gymOrgId,
        });
        return NextResponse.json({ invites });
    } catch (error) {
        if (error instanceof ApiClientError) {
            return NextResponse.json(
                { error: { code: error.code, message: staffInviteErrorMessage(error.code, error.message) } },
                { status: error.status === 0 ? 502 : error.status },
            );
        }
        return NextResponse.json(
            { error: { code: 'NETWORK_OR_UNKNOWN', message: staffInviteErrorMessage('NETWORK_OR_UNKNOWN') } },
            { status: 500 },
        );
    }
}
