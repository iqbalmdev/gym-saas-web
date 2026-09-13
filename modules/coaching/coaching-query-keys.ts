/** Query-key factory for M6/M7 Coaching (ADR-0011). */
export const coachingKeys = {
    all: ['coaching'] as const,
    myDietPlan: () => [...coachingKeys.all, 'me', 'diet-plan'] as const,
    myWorkoutSchedule: (from: string, to: string) => [...coachingKeys.all, 'me', 'workout-schedule', from, to] as const,
    myWorkoutStreak: () => [...coachingKeys.all, 'me', 'workout-streak'] as const,
};
