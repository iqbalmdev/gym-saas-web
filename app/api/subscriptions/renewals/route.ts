import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireStaffGym } from '@/lib/auth/staff-gym-gate';
import { subscriptionErrorMessage } from '@/modules/subscriptions/subscriptions-errors';
import { listRenewalsDueForGym } from '@/modules/subscriptions/subscriptions-queries';

/** Client refetch endpoint for the renewals inbox (ADR-0011). Gate → shared query → JSON. */

function isoDateOffset(days: number): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

function parseDate(raw: string | null, fallback: string): string {
    return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback;
}

export async function GET(request: NextRequest) {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: subscriptionErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    const params = request.nextUrl.searchParams;
    try {
        const renewals = await listRenewalsDueForGym({
            accessToken: gate.session.accessToken,
            gymOrgId: gate.gymOrgId,
            onOrAfter: parseDate(params.get('onOrAfter'), isoDateOffset(0)),
            onOrBefore: parseDate(params.get('onOrBefore'), isoDateOffset(2)),
        });
        return NextResponse.json({ renewals });
    } catch (error) {
        if (error instanceof ApiClientError) {
            return NextResponse.json(
                { error: { code: error.code, message: subscriptionErrorMessage(error.code, error.message) } },
                { status: error.status === 0 ? 502 : error.status },
            );
        }
        return NextResponse.json(
            { error: { code: 'NETWORK_OR_UNKNOWN', message: subscriptionErrorMessage('NETWORK_OR_UNKNOWN') } },
            { status: 500 },
        );
    }
}
