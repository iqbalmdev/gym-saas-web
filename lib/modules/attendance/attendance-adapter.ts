import { z } from 'zod';

import { endpoints } from '@/lib/modules/attendance/attendance-endpoints';
import type { HttpClient } from '@/lib/api/client';
import type { Attendance, AttendanceReader, AttendanceWriter } from '@/lib/modules/attendance/attendance-ports';

const attendanceSchema = z.object({
    id: z.string().min(1),
    clientUserId: z.string().min(1),
    gymOrgId: z.string().min(1).optional(),
    occurredAt: z.string().min(1),
    recordedBy: z.enum(['CLIENT', 'ADMIN']),
    recorderUserId: z.string().min(1),
    createdAt: z.string().min(1).optional(),
    baseStarted: z.boolean().optional(),
});

const attendanceEnvelopeSchema = z.object({
    attendance: attendanceSchema,
});

const pageSchema = z.object({
    attendances: z.object({
        items: z.array(attendanceSchema),
        total: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        offset: z.number().int().nonnegative(),
    }),
});

function normalizeAttendance(raw: z.infer<typeof attendanceSchema>, gymOrgId: string): Attendance {
    return {
        id: raw.id,
        clientUserId: raw.clientUserId,
        gymOrgId: raw.gymOrgId ?? gymOrgId,
        occurredAt: raw.occurredAt,
        recordedBy: raw.recordedBy,
        recorderUserId: raw.recorderUserId,
        createdAt: raw.createdAt ?? '',
        baseStarted: raw.baseStarted ?? false,
    };
}

function dayQuery(input: { day: string; limit?: number; offset?: number }): string {
    const params = new URLSearchParams();
    params.set('day', input.day);
    params.set('limit', String(input.limit ?? 50));
    params.set('offset', String(input.offset ?? 0));
    return params.toString();
}

export function createAttendanceAdapter(http: HttpClient): AttendanceReader & AttendanceWriter {
    return {
        async listForDay({ accessToken, gymOrgId, day, limit, offset }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.gymOrgAttendances(gymOrgId)}?${dayQuery({ day, limit, offset })}`,
                method: 'GET',
                accessToken,
            });
            const parsed = pageSchema.parse(raw);
            return {
                attendances: {
                    ...parsed.attendances,
                    items: parsed.attendances.items.map((item) => normalizeAttendance(item, gymOrgId)),
                },
            };
        },

        async deskMark({ accessToken, gymOrgId, clientUserId }) {
            const raw = await http.request<unknown>({
                path: endpoints.gymOrgAttendanceDeskMark(gymOrgId),
                method: 'POST',
                accessToken,
                body: { clientUserId },
            });
            const parsed = attendanceEnvelopeSchema.parse(raw);
            return {
                attendance: normalizeAttendance(parsed.attendance, gymOrgId),
            };
        },
    };
}
