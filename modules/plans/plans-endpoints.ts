/** Named Gym Backend paths for the plan catalog — adapters only. */
export const endpoints = {
    gymOrgPlans: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/plans`,
    gymOrgPlan: (gymOrgId: string, planId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/plans/${encodeURIComponent(planId)}`,
} as const;
