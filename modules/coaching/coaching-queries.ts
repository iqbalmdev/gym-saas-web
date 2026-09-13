import { createAppServices } from '@/lib/api/composition';
import type { DietPlan, WorkoutSchedule, WorkoutStreak } from '@/modules/coaching/coaching-ports';

export async function getMyDietPlanForSession(input: {
    accessToken: string;
    gymOrgId: string;
}): Promise<DietPlan | null> {
    const { getMyDietPlan } = createAppServices();
    const { dietPlan } = await getMyDietPlan(input);
    return dietPlan;
}

export async function getMyWorkoutScheduleForSession(input: {
    accessToken: string;
    gymOrgId: string;
    from: string;
    to: string;
}): Promise<WorkoutSchedule> {
    const { getMyWorkoutSchedule } = createAppServices();
    return getMyWorkoutSchedule(input);
}

export async function getMyWorkoutStreakForSession(input: {
    accessToken: string;
    gymOrgId: string;
}): Promise<WorkoutStreak> {
    const { getMyWorkoutStreak } = createAppServices();
    return getMyWorkoutStreak(input);
}
