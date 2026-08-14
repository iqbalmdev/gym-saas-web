/** Named Gym Backend paths for desk attendance — adapters only. */
export const endpoints = {
    gymOrgAttendances: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/attendances`,
    gymOrgAttendanceDeskMark: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/attendances/desk-mark`,
} as const;
