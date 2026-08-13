import { AttendanceAdminPanel } from '@/lib/modules/attendance/components/attendance-admin-panel';
import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { getSession, isStaffSession } from '@/lib/auth/session';
import { attendanceErrorMessage } from '@/lib/modules/attendance/attendance-errors';
import { listStaffGymOrgs } from '@/lib/modules/gym-orgs/list-staff-gym-orgs';
import type { Attendance } from '@/lib/modules/attendance/attendance-ports';
import type { RosterMember } from '@/lib/modules/roster/roster-ports';

function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
}

export default async function AttendancePage() {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        return null;
    }

    const gymOrgs = await listStaffGymOrgs(session.accessToken);
    const gym = gymOrgs[0];
    if (!gym) {
        return null;
    }

    const day = todayIsoDate();
    let members: RosterMember[] = [];
    let attendances: Attendance[] = [];
    let listError: string | null = null;

    try {
        const { listRosterMembers, listDayAttendances } = createAppServices();
        const [roster, dayPage] = await Promise.all([
            listRosterMembers({
                accessToken: session.accessToken,
                gymOrgId: gym.id,
                status: 'ACTIVE',
            }),
            listDayAttendances({
                accessToken: session.accessToken,
                gymOrgId: gym.id,
                day,
            }),
        ]);
        members = roster.members;
        attendances = dayPage.attendances.items;
    } catch (error) {
        listError =
            error instanceof ApiClientError
                ? attendanceErrorMessage(error.code, error.message)
                : attendanceErrorMessage('NETWORK_OR_UNKNOWN');
    }

    return (
        <AttendanceAdminPanel
            gymName={gym.name}
            day={day}
            members={members}
            attendances={attendances}
            listError={listError}
        />
    );
}
