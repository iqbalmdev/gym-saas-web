/**
 * Desk attendance — Postman Attendance folder (Admin desk-mark + day list).
 * Authz: Auth + STAFF session + gym tenant; API enforces ADMIN.
 * No DataGrant — attendance is gym-owned.
 */

export type AttendanceRecordedBy = 'CLIENT' | 'ADMIN';

export type Attendance = {
    id: string;
    clientUserId: string;
    gymOrgId: string;
    occurredAt: string;
    recordedBy: AttendanceRecordedBy;
    recorderUserId: string;
    createdAt: string;
    baseStarted: boolean;
};

export type AttendancePage = {
    items: Attendance[];
    total: number;
    limit: number;
    offset: number;
};

export type AttendanceReader = {
    listForDay: (input: {
        accessToken: string;
        gymOrgId: string;
        day: string;
        limit?: number;
        offset?: number;
    }) => Promise<{ attendances: AttendancePage }>;
};

export type AttendanceWriter = {
    deskMark: (input: {
        accessToken: string;
        gymOrgId: string;
        clientUserId: string;
    }) => Promise<{ attendance: Attendance }>;
};
