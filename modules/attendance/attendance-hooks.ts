'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getJson } from '@/lib/query/api-fetch';
import { deskMarkAttendanceAction } from '@/modules/attendance/attendance-actions';
import { attendanceErrorMessage } from '@/modules/attendance/attendance-errors';
import type { Attendance } from '@/modules/attendance/attendance-ports';
import { attendanceKeys } from '@/modules/attendance/attendance-query-keys';
import type { AttendanceDayData } from '@/modules/attendance/attendance-queries';

/** Desk attendance client hooks (ADR-0011). */

export function useAttendanceDay(day: string) {
    return useQuery({
        queryKey: attendanceKeys.day(day),
        queryFn: () =>
            getJson<AttendanceDayData>(`/api/attendance?day=${day}`, attendanceErrorMessage('NETWORK_OR_UNKNOWN')),
    });
}

export function useDeskMarkAttendance(day: string, gymOrgId: string) {
    const queryClient = useQueryClient();
    const key = attendanceKeys.day(day);

    return useMutation({
        mutationFn: async (input: { clientUserId: string }) => {
            const result = await deskMarkAttendanceAction(input);
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onMutate: async (input) => {
            await queryClient.cancelQueries({ queryKey: key });
            const previous = queryClient.getQueryData<AttendanceDayData>(key);
            if (previous) {
                // Placeholder id/timestamps: the refetch in onSettled replaces
                // this row with the server's copy moments later.
                const optimistic: Attendance = {
                    id: `optimistic-${input.clientUserId}`,
                    clientUserId: input.clientUserId,
                    gymOrgId,
                    occurredAt: new Date().toISOString(),
                    recordedBy: 'ADMIN',
                    recorderUserId: 'pending',
                    createdAt: new Date().toISOString(),
                    baseStarted: false,
                };
                queryClient.setQueryData<AttendanceDayData>(key, {
                    ...previous,
                    attendances: [optimistic, ...previous.attendances],
                });
            }
            return { previous };
        },
        onError: (_error, _input, context) => {
            if (context?.previous) {
                queryClient.setQueryData<AttendanceDayData>(key, context.previous);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
    });
}
