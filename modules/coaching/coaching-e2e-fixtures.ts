/**
 * Playwright fixture adapter for M6/M7 Coaching (`GYM_SAAS_E2E_FIXTURES=1`).
 */
import { ApiClientError } from '@/lib/api/errors';
import {
    E2E_CLIENT_TOKEN,
    E2E_GYM_ID,
    e2eDietPlan,
    e2eWorkoutScheduleByGym,
    e2eWorkoutStreakByGym,
    isoDateLocal,
} from '@/lib/api/e2e/store';
import type {
    CoachingReader,
    CoachingWriter,
    DietPlan,
    DietPlanItem,
    ScheduleExercise,
    WorkoutSchedule,
    WorkoutScheduleDay,
} from '@/modules/coaching/coaching-ports';

function requireClientToken(accessToken: string): void {
    if (accessToken !== E2E_CLIENT_TOKEN) {
        throw new ApiClientError({
            code: 'COACHING_FORBIDDEN',
            message: 'Coaching self-read requires CLIENT lane',
            status: 403,
        });
    }
}

function cloneDietPlan(plan: DietPlan): DietPlan {
    return {
        ...plan,
        logDate: isoDateLocal(),
        meals: plan.meals.map((meal) => ({
            ...meal,
            items: meal.items.map((item) => ({ ...item })),
        })),
    };
}

function findDietItem(plan: DietPlan, itemId: string): DietPlanItem | null {
    for (const meal of plan.meals) {
        const item = meal.items.find((row) => row.id === itemId);
        if (item) {
            return item;
        }
    }
    return null;
}

function cloneSchedule(schedule: WorkoutSchedule): WorkoutSchedule {
    return {
        ...schedule,
        today: isoDateLocal(),
        days: schedule.days.map((day) => ({
            ...day,
            sessions: day.sessions.map((session) => ({
                ...session,
                exercises: session.exercises.map((exercise) => ({ ...exercise })),
            })),
        })),
    };
}

function findExercise(schedule: WorkoutSchedule, itemId: string): ScheduleExercise | null {
    for (const day of schedule.days) {
        for (const session of day.sessions) {
            const exercise = session.exercises.find((row) => row.id === itemId);
            if (exercise) {
                return exercise;
            }
        }
    }
    return null;
}

function recomputeDay(day: WorkoutScheduleDay): void {
    if (day.kind === 'REST') {
        day.dayDone = true;
        day.adherencePercent = null;
        return;
    }
    const exercises = day.sessions.flatMap((session) => session.exercises);
    const total = exercises.length;
    const done = exercises.filter((exercise) => exercise.completed).length;
    day.dayDone = total > 0 && done === total;
    day.adherencePercent = total === 0 ? 0 : Math.round((done / total) * 100);
}

export function createE2eCoachingAdapter(): CoachingReader & CoachingWriter {
    return {
        async getMyDietPlan({ accessToken, gymOrgId }) {
            requireClientToken(accessToken);
            if (gymOrgId !== E2E_GYM_ID) {
                return { dietPlan: null };
            }
            return { dietPlan: cloneDietPlan(e2eDietPlan) };
        },

        async getMyWorkoutSchedule({ accessToken, gymOrgId, from, to }) {
            requireClientToken(accessToken);
            if (gymOrgId !== E2E_GYM_ID) {
                return { today: isoDateLocal(), writable: true, days: [] };
            }
            const schedule = e2eWorkoutScheduleByGym.get(gymOrgId);
            if (!schedule) {
                return { today: isoDateLocal(), writable: true, days: [] };
            }
            const cloned = cloneSchedule(schedule);
            cloned.days = cloned.days.filter((day) => day.scheduleDate >= from && day.scheduleDate <= to);
            return cloned;
        },

        async getMyWorkoutStreak({ accessToken, gymOrgId }) {
            requireClientToken(accessToken);
            const streak = e2eWorkoutStreakByGym.get(gymOrgId);
            if (!streak) {
                return { asOf: isoDateLocal(), currentStreak: 0, longestStreak: 0, lookbackDays: 366 };
            }
            return { ...streak, asOf: isoDateLocal() };
        },

        async completeDietItem({ accessToken, gymOrgId, itemId }) {
            requireClientToken(accessToken);
            const item = findDietItem(e2eDietPlan, itemId);
            if (!item) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Diet item not found', status: 404 });
            }
            if (item.logged) {
                throw new ApiClientError({
                    code: 'ALREADY_LOGGED_PRESCRIBED',
                    message: 'Already logged',
                    status: 409,
                });
            }
            if (gymOrgId !== E2E_GYM_ID || !e2eDietPlan.writable) {
                throw new ApiClientError({
                    code: 'COACHING_ADDON_REQUIRED',
                    message: 'Addon required',
                    status: 409,
                });
            }
            item.logged = true;
        },

        async uncompleteDietItem({ accessToken, gymOrgId, itemId }) {
            requireClientToken(accessToken);
            const item = findDietItem(e2eDietPlan, itemId);
            if (!item) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Diet item not found', status: 404 });
            }
            if (gymOrgId !== E2E_GYM_ID || !e2eDietPlan.writable) {
                throw new ApiClientError({
                    code: 'COACHING_ADDON_REQUIRED',
                    message: 'Addon required',
                    status: 409,
                });
            }
            item.logged = false;
        },

        async completeScheduleExercise({ accessToken, gymOrgId, itemId }) {
            requireClientToken(accessToken);
            const schedule = e2eWorkoutScheduleByGym.get(gymOrgId);
            if (!schedule) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Schedule not found', status: 404 });
            }
            const exercise = findExercise(schedule, itemId);
            if (!exercise) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Exercise not found', status: 404 });
            }
            if (exercise.completed) {
                throw new ApiClientError({
                    code: 'ALREADY_COMPLETED_WORKOUT_EXERCISE',
                    message: 'Already completed',
                    status: 409,
                });
            }
            if (!schedule.writable) {
                throw new ApiClientError({
                    code: 'COACHING_ADDON_REQUIRED',
                    message: 'Addon required',
                    status: 409,
                });
            }
            exercise.completed = true;
            for (const day of schedule.days) {
                recomputeDay(day);
            }
        },

        async uncompleteScheduleExercise({ accessToken, gymOrgId, itemId }) {
            requireClientToken(accessToken);
            const schedule = e2eWorkoutScheduleByGym.get(gymOrgId);
            if (!schedule) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Schedule not found', status: 404 });
            }
            const exercise = findExercise(schedule, itemId);
            if (!exercise) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Exercise not found', status: 404 });
            }
            if (!schedule.writable) {
                throw new ApiClientError({
                    code: 'COACHING_ADDON_REQUIRED',
                    message: 'Addon required',
                    status: 409,
                });
            }
            exercise.completed = false;
            for (const day of schedule.days) {
                recomputeDay(day);
            }
        },
    };
}
