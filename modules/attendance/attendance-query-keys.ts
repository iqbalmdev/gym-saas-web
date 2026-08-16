/** Query-key factory for the desk attendance screen (ADR-0011). */
export const attendanceKeys = {
    all: ['attendance'] as const,
    day: (day: string) => [...attendanceKeys.all, 'day', day] as const,
};
