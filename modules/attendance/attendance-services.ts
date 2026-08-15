import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled, createE2eAttendanceAdapter } from '@/lib/api/e2e-fixtures';
import { createAttendanceAdapter } from '@/modules/attendance/attendance-adapter';
import { createDeskMarkAttendance, createListDayAttendances } from '@/modules/attendance/attendance-use-cases';

/** Binds the attendance port to its adapter and use-cases (ADR-0007). */
export function attendanceServices(http: HttpClient) {
    const attendance = areE2eFixturesEnabled() ? createE2eAttendanceAdapter() : createAttendanceAdapter(http);
    return {
        attendance,
        listDayAttendances: createListDayAttendances({ attendance }),
        deskMarkAttendance: createDeskMarkAttendance({ attendance }),
    };
}
