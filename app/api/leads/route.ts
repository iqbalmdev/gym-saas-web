import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireStaffGym } from '@/lib/auth/staff-gym-gate';
import { leadErrorMessage } from '@/modules/leads/leads-errors';
import type { LeadStatus } from '@/modules/leads/leads-ports';
import { listLeadsPageForGym } from '@/modules/leads/leads-queries';

/** Client refetch endpoint for the CRM pipeline (ADR-0011). Gate → shared query → JSON. */

function parseStatus(raw: string | null): LeadStatus | 'ALL' {
    if (raw === 'NEW' || raw === 'CONTACTED' || raw === 'TRIAL' || raw === 'CONVERTED' || raw === 'LOST') {
        return raw;
    }
    return 'ALL';
}

export async function GET(request: NextRequest) {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: leadErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    try {
        const data = await listLeadsPageForGym({
            accessToken: gate.session.accessToken,
            // Tenant comes from the session gate, never from the query string.
            gymOrgId: gate.gymOrgId,
            statusFilter: parseStatus(request.nextUrl.searchParams.get('status')),
        });
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof ApiClientError) {
            return NextResponse.json(
                { error: { code: error.code, message: leadErrorMessage(error.code, error.message) } },
                { status: error.status === 0 ? 502 : error.status },
            );
        }
        return NextResponse.json(
            { error: { code: 'NETWORK_OR_UNKNOWN', message: leadErrorMessage('NETWORK_OR_UNKNOWN') } },
            { status: 500 },
        );
    }
}
