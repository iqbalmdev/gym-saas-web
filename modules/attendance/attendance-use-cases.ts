import type { AttendanceReader, AttendanceWriter } from '@/modules/attendance/attendance-ports';

export function createListDayAttendances(deps: { attendance: AttendanceReader }) {
    return async function listDayAttendances(input: { accessToken: string; gymOrgId: string; day: string }) {
        return deps.attendance.listForDay(input);
    };
}

export function createDeskMarkAttendance(deps: { attendance: AttendanceWriter }) {
    return async function deskMarkAttendance(input: { accessToken: string; gymOrgId: string; clientUserId: string }) {
        return deps.attendance.deskMark(input);
    };
}
