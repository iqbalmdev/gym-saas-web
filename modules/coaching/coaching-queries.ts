import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import type { GrantAware } from '@/lib/domain/grant-aware';
import { isWorkoutPlansGrantMissing } from '@/modules/coaching/coaching-errors';
import type {
    DietPlan,
    DietPlanTemplate,
    StaffDietPlan,
    StaffWorkoutScheduleDay,
    WorkoutPlanTemplate,
    WorkoutSchedule,
    WorkoutStreak,
} from '@/modules/coaching/coaching-ports';

const TEMPLATE_PAGE_SIZE = 50;

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

export async function listDietPlanTemplatesForGym(input: {
    accessToken: string;
    gymOrgId: string;
}): Promise<DietPlanTemplate[]> {
    const { listDietPlanTemplates } = createAppServices();
    const { dietPlanTemplates } = await listDietPlanTemplates({
        ...input,
        limit: TEMPLATE_PAGE_SIZE,
        offset: 0,
    });
    return dietPlanTemplates.items;
}

export async function listWorkoutPlanTemplatesForGym(input: {
    accessToken: string;
    gymOrgId: string;
}): Promise<WorkoutPlanTemplate[]> {
    const { listWorkoutPlanTemplates } = createAppServices();
    const { workoutPlanTemplates } = await listWorkoutPlanTemplates({
        ...input,
        limit: TEMPLATE_PAGE_SIZE,
        offset: 0,
    });
    return workoutPlanTemplates.items;
}

export async function getStaffClientDietPlanForGym(input: {
    accessToken: string;
    gymOrgId: string;
    clientUserId: string;
}): Promise<StaffDietPlan | null> {
    const { getClientDietPlan } = createAppServices();
    const { dietPlan } = await getClientDietPlan(input);
    return dietPlan;
}

export async function getStaffClientWorkoutScheduleForGym(input: {
    accessToken: string;
    gymOrgId: string;
    clientUserId: string;
    from: string;
    to: string;
}): Promise<GrantAware<StaffWorkoutScheduleDay[]>> {
    const { getClientWorkoutSchedule } = createAppServices();
    try {
        const { days } = await getClientWorkoutSchedule(input);
        return { status: 'ok', data: days };
    } catch (error) {
        if (error instanceof ApiClientError && isWorkoutPlansGrantMissing(error.code)) {
            return { status: 'not_shared' };
        }
        throw error;
    }
}

export async function getStaffClientWorkoutStreakForGym(input: {
    accessToken: string;
    gymOrgId: string;
    clientUserId: string;
}): Promise<GrantAware<WorkoutStreak>> {
    const { getClientWorkoutStreak } = createAppServices();
    try {
        const streak = await getClientWorkoutStreak(input);
        return { status: 'ok', data: streak };
    } catch (error) {
        if (error instanceof ApiClientError && isWorkoutPlansGrantMissing(error.code)) {
            return { status: 'not_shared' };
        }
        throw error;
    }
}
