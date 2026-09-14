/** Query-key factory for M6/M7 Coaching (ADR-0011). */
export const coachingKeys = {
    all: ['coaching'] as const,
    myDietPlan: () => [...coachingKeys.all, 'me', 'diet-plan'] as const,
    myWorkoutSchedule: (from: string, to: string) => [...coachingKeys.all, 'me', 'workout-schedule', from, to] as const,
    myWorkoutStreak: () => [...coachingKeys.all, 'me', 'workout-streak'] as const,
    dietTemplates: () => [...coachingKeys.all, 'diet-templates'] as const,
    workoutTemplates: () => [...coachingKeys.all, 'workout-templates'] as const,
    staffClientDietPlan: (clientUserId: string) => [...coachingKeys.all, 'staff', clientUserId, 'diet-plan'] as const,
    staffClientWorkoutSchedule: (clientUserId: string, from: string, to: string) =>
        [...coachingKeys.all, 'staff', clientUserId, 'workout-schedule', from, to] as const,
    staffClientWorkoutStreak: (clientUserId: string) =>
        [...coachingKeys.all, 'staff', clientUserId, 'workout-streak'] as const,
};
