import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireStaffGym } from '@/lib/auth/staff-gym-gate';
import { planErrorMessage } from '@/modules/plans/plans-errors';
import { listPlansForGym } from '@/modules/plans/plans-queries';
import type { PlanKind } from '@/modules/plans/plans-ports';

/**
 * Client refetch endpoint for the plan catalog (ADR-0011). First paint does
 * not come through here — `plans/page.tsx` prefetches server-side and hydrates
 * — this serves TanStack's refetch/invalidate after a mutation or filter
 * change.
 *
 * Thin by design: gate → shared query function → JSON. All catalogue logic
 * lives in `plans-queries.ts` so this cannot drift from the prefetch.
 */

function parseKind(raw: string | null): PlanKind | 'ALL' {
    if (raw === 'BASE' || raw === 'ADDON') {
        return raw;
    }
    return 'ALL';
}

export async function GET(request: NextRequest) {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: planErrorMessage(gate.code) } },
            {
                status: gate.status,
            },
        );
    }

    try {
        const plans = await listPlansForGym({
            accessToken: gate.session.accessToken,
            // Tenant comes from the session gate, never from the query string.
            gymOrgId: gate.gymOrgId,
            kindFilter: parseKind(request.nextUrl.searchParams.get('kind')),
        });
        return NextResponse.json({ plans });
    } catch (error) {
        if (error instanceof ApiClientError) {
            return NextResponse.json(
                { error: { code: error.code, message: planErrorMessage(error.code, error.message) } },
                { status: error.status === 0 ? 502 : error.status },
            );
        }
        return NextResponse.json(
            { error: { code: 'NETWORK_OR_UNKNOWN', message: planErrorMessage('NETWORK_OR_UNKNOWN') } },
            { status: 500 },
        );
    }
}
