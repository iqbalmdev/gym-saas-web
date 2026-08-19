import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireStaffGym } from '@/lib/auth/staff-gym-gate';
import { attendanceErrorMessage } from '@/modules/attendance/attendance-errors';
import { listAttendanceDayForGym } from '@/modules/attendance/attendance-queries';

/** Client refetch endpoint for the desk (ADR-0011). Gate → shared query → JSON. */

function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
}

/** Guards against an arbitrary `day` string reaching the API. */
function parseDay(raw: string | null): string {
    return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : todayIsoDate();
}

export async function GET(request: NextRequest) {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: attendanceErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    try {
        const data = await listAttendanceDayForGym({
            accessToken: gate.session.accessToken,
            gymOrgId: gate.gymOrgId,
            day: parseDay(request.nextUrl.searchParams.get('day')),
        });
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof ApiClientError) {
            return NextResponse.json(
                { error: { code: error.code, message: attendanceErrorMessage(error.code, error.message) } },
                { status: error.status === 0 ? 502 : error.status },
            );
        }
        return NextResponse.json(
            { error: { code: 'NETWORK_OR_UNKNOWN', message: attendanceErrorMessage('NETWORK_OR_UNKNOWN') } },
            { status: 500 },
        );
    }
}
