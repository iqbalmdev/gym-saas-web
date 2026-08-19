import { createAppServices } from '@/lib/api/composition';
import type { Attendance } from '@/modules/attendance/attendance-ports';
import type { RosterMember } from '@/modules/roster/roster-ports';

export type AttendanceDayData = {
    members: RosterMember[];
    attendances: Attendance[];
};

/**
 * Server-side read for the desk (ADR-0011). The roster rides along because the
 * desk-mark picker needs it to resolve names — it is part of this screen's
 * payload, not a separately actionable list.
 */
export async function listAttendanceDayForGym(input: {
    accessToken: string;
    gymOrgId: string;
    day: string;
}): Promise<AttendanceDayData> {
    const { listRosterMembers, listDayAttendances } = createAppServices();
    const [roster, dayPage] = await Promise.all([
        listRosterMembers({ accessToken: input.accessToken, gymOrgId: input.gymOrgId, status: 'ACTIVE' }),
        listDayAttendances({ accessToken: input.accessToken, gymOrgId: input.gymOrgId, day: input.day }),
    ]);
    return { members: roster.members, attendances: dayPage.attendances.items };
}
