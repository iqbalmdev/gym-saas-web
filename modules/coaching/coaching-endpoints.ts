/** Named Gym Backend paths for M6/M7 Coaching — adapters only. */
export const endpoints = {
    myDietPlan: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-diet-plan`,
    myDietPlanItemComplete: (gymOrgId: string, itemId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-diet-plan/items/${encodeURIComponent(itemId)}/complete`,
    myWorkoutSchedule: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-workout-schedule`,
    myWorkoutScheduleItemComplete: (gymOrgId: string, itemId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-workout-schedule/items/${encodeURIComponent(itemId)}/complete`,
    myWorkoutStreak: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-workout-streak`,
} as const;
