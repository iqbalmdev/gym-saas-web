/** Named Gym Backend paths for M6/M7 Coaching — adapters only. */
export const endpoints = {
    myDietPlan: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-diet-plan`,
    myDietPlanItemComplete: (gymOrgId: string, itemId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-diet-plan/items/${encodeURIComponent(itemId)}/complete`,
    myWorkoutSchedule: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-workout-schedule`,
    myWorkoutScheduleItemComplete: (gymOrgId: string, itemId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-workout-schedule/items/${encodeURIComponent(itemId)}/complete`,
    myWorkoutStreak: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-workout-streak`,
    exercisesSearch: () => '/exercises/search',
    dietPlanTemplates: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/diet-plan-templates`,
    dietPlanTemplate: (gymOrgId: string, templateId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/diet-plan-templates/${encodeURIComponent(templateId)}`,
    dietPlanTemplateDuplicate: (gymOrgId: string, templateId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/diet-plan-templates/${encodeURIComponent(templateId)}/duplicate`,
    workoutPlanTemplates: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/workout-plan-templates`,
    workoutPlanTemplate: (gymOrgId: string, templateId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/workout-plan-templates/${encodeURIComponent(templateId)}`,
    workoutPlanTemplateDuplicate: (gymOrgId: string, templateId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/workout-plan-templates/${encodeURIComponent(templateId)}/duplicate`,
    clientDietPlans: (gymOrgId: string, clientUserId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/clients/${encodeURIComponent(clientUserId)}/diet-plans`,
    clientWorkoutSchedule: (gymOrgId: string, clientUserId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/clients/${encodeURIComponent(clientUserId)}/workout-schedule`,
    clientWorkoutStreak: (gymOrgId: string, clientUserId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/clients/${encodeURIComponent(clientUserId)}/workout-streak`,
} as const;
