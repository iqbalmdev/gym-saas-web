/**
 * Playwright fixture adapter for M6/M7 Coaching (`GYM_SAAS_E2E_FIXTURES=1`).
 */
import { ApiClientError } from '@/lib/api/errors';
import {
    E2E_CLIENT_TOKEN,
    E2E_EXERCISE_BENCH_ID,
    E2E_GYM_ID,
    E2E_STAFF_TOKEN_WITH_GYM,
    E2E_TRAINER_PROFILE_ID,
    e2eDietPlan,
    e2eDietPlanTemplates,
    e2eExerciseCatalog,
    e2eNextId,
    e2eStaffClientDietPlans,
    e2eStaffClientGrants,
    e2eStaffClientWorkoutSchedules,
    e2eWorkoutPlanTemplates,
    e2eWorkoutScheduleByGym,
    e2eWorkoutStreakByGym,
    isoDateLocal,
} from '@/lib/api/e2e/store';
import type {
    CoachingReader,
    CoachingWriter,
    DietPlan,
    DietPlanItem,
    DietPlanTemplate,
    DietPlanTemplateWriteBody,
    ScheduleExercise,
    StaffDietPlan,
    StaffWorkoutScheduleDay,
    WorkoutPlanTemplate,
    WorkoutPlanTemplateWriteBody,
    WorkoutSchedule,
    WorkoutScheduleDay,
    WorkoutScheduleUpsertEntry,
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

function requireStaffToken(accessToken: string): void {
    if (accessToken !== E2E_STAFF_TOKEN_WITH_GYM) {
        throw new ApiClientError({
            code: 'COACHING_FORBIDDEN',
            message: 'Coaching staff actions require STAFF lane',
            status: 403,
        });
    }
}

function hasWorkoutPlansGrant(gymOrgId: string, clientUserId: string): boolean {
    const grants = e2eStaffClientGrants.get(`${gymOrgId}:${clientUserId}`);
    return grants?.classGrants.includes('WORKOUT_PLANS') ?? false;
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

function cloneDietTemplate(template: DietPlanTemplate): DietPlanTemplate {
    return {
        ...template,
        meals: template.meals.map((meal) => ({
            ...meal,
            items: meal.items.map((item) => ({ ...item })),
        })),
    };
}

function cloneWorkoutTemplate(template: WorkoutPlanTemplate): WorkoutPlanTemplate {
    return {
        ...template,
        exercises: template.exercises.map((exercise) => ({ ...exercise })),
    };
}

function staffScheduleKey(gymOrgId: string, clientUserId: string): string {
    return `${gymOrgId}:${clientUserId}`;
}

function templateFromDietWrite(body: DietPlanTemplateWriteBody): DietPlanTemplate {
    const id = e2eNextId('diet-template-new');
    return {
        id,
        gymOrgId: E2E_GYM_ID,
        trainerId: E2E_TRAINER_PROFILE_ID,
        title: body.title,
        notes: body.notes ?? null,
        clonedFromId: null,
        meals: body.meals.map((meal) => ({
            id: e2eNextId('diet-template-meal-new'),
            mealSlot: meal.mealSlot,
            items: meal.items.map((item) => ({
                id: e2eNextId('diet-template-item-new'),
                foodItemId: item.foodItemId,
                servingId: item.servingId,
                quantity: item.quantity,
            })),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

function templateFromWorkoutWrite(body: WorkoutPlanTemplateWriteBody): WorkoutPlanTemplate {
    const id = e2eNextId('workout-template-new');
    const bench = e2eExerciseCatalog.find((row) => row.id === E2E_EXERCISE_BENCH_ID);
    return {
        id,
        gymOrgId: E2E_GYM_ID,
        trainerId: E2E_TRAINER_PROFILE_ID,
        title: body.title,
        notes: body.notes ?? null,
        clonedFromId: null,
        exercises: body.exercises.map((exercise, index) => ({
            id: e2eNextId('workout-template-exercise-new'),
            exerciseItemId: exercise.exerciseItemId,
            name: bench?.name ?? 'Exercise',
            primaryMuscle: bench?.primaryMuscle,
            equipment: bench?.equipment,
            sets: exercise.sets ?? null,
            reps: exercise.reps ?? null,
            notes: exercise.notes ?? null,
            sortOrder: index,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

function staffPlanFromTemplate(template: DietPlanTemplate): StaffDietPlan {
    return {
        id: e2eNextId('staff-diet-plan-new'),
        title: template.title,
        notes: template.notes,
        status: 'ACTIVE',
        writable: false,
        meals: template.meals.map((meal) => ({
            id: e2eNextId('staff-diet-meal-new'),
            mealSlot: meal.mealSlot,
            items: meal.items.map((item) => ({
                id: e2eNextId('staff-diet-item-new'),
                foodItemId: item.foodItemId,
                servingId: item.servingId,
                quantity: item.quantity,
                mealSlot: meal.mealSlot,
            })),
        })),
    };
}

function upsertStaffScheduleDays(
    gymOrgId: string,
    clientUserId: string,
    entries: WorkoutScheduleUpsertEntry[],
): StaffWorkoutScheduleDay[] {
    const key = staffScheduleKey(gymOrgId, clientUserId);
    const existing = e2eStaffClientWorkoutSchedules.get(key) ?? [];
    const byDate = new Map(existing.map((day) => [day.scheduleDate, day]));

    for (const entry of entries) {
        if (entry.kind === 'REST') {
            byDate.set(entry.date, {
                id: e2eNextId('staff-schedule-day-new'),
                clientUserId,
                gymOrgId,
                trainerId: E2E_TRAINER_PROFILE_ID,
                scheduleDate: entry.date,
                kind: 'REST',
                morningTemplateId: null,
                eveningTemplateId: null,
                sessions: [],
                dayDone: true,
                adherencePercent: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            continue;
        }

        const morningId = entry.morningTemplateId ?? null;
        const eveningId = entry.eveningTemplateId ?? null;
        const sessions: StaffWorkoutScheduleDay['sessions'] = [];
        if (morningId) {
            const template = e2eWorkoutPlanTemplates.find((row) => row.id === morningId);
            sessions.push({
                id: e2eNextId('staff-session-new'),
                slot: 'MORNING',
                title: template?.title ?? 'Morning workout',
                clonedFromTemplateId: morningId,
                exercises: (template?.exercises ?? []).map((exercise) => ({
                    id: e2eNextId('staff-schedule-exercise-new'),
                    exerciseItemId: exercise.exerciseItemId,
                    name: exercise.name ?? 'Exercise',
                    sets: exercise.sets ?? 0,
                    reps: exercise.reps ?? '',
                    notes: exercise.notes,
                    sortOrder: exercise.sortOrder,
                    completed: false,
                })),
            });
        }
        if (eveningId) {
            const template = e2eWorkoutPlanTemplates.find((row) => row.id === eveningId);
            sessions.push({
                id: e2eNextId('staff-session-new'),
                slot: 'EVENING',
                title: template?.title ?? 'Evening workout',
                clonedFromTemplateId: eveningId,
                exercises: (template?.exercises ?? []).map((exercise) => ({
                    id: e2eNextId('staff-schedule-exercise-new'),
                    exerciseItemId: exercise.exerciseItemId,
                    name: exercise.name ?? 'Exercise',
                    sets: exercise.sets ?? 0,
                    reps: exercise.reps ?? '',
                    notes: exercise.notes,
                    sortOrder: exercise.sortOrder,
                    completed: false,
                })),
            });
        }

        byDate.set(entry.date, {
            id: e2eNextId('staff-schedule-day-new'),
            clientUserId,
            gymOrgId,
            trainerId: E2E_TRAINER_PROFILE_ID,
            scheduleDate: entry.date,
            kind: 'TRAINING',
            morningTemplateId: morningId,
            eveningTemplateId: eveningId,
            sessions,
            dayDone: false,
            adherencePercent: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }

    const days = [...byDate.values()].sort((a, b) => a.scheduleDate.localeCompare(b.scheduleDate));
    e2eStaffClientWorkoutSchedules.set(key, days);
    return entries.map((entry) => byDate.get(entry.date)!);
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

        async searchExercises({ accessToken, query }) {
            requireStaffToken(accessToken);
            const needle = query.trim().toLowerCase();
            const exercises = e2eExerciseCatalog.filter(
                (row) =>
                    needle.length === 0 ||
                    row.name.toLowerCase().includes(needle) ||
                    row.aliases.some((alias) => alias.toLowerCase().includes(needle)),
            );
            return { exercises };
        },

        async listDietPlanTemplates({ accessToken, gymOrgId }) {
            requireStaffToken(accessToken);
            if (gymOrgId !== E2E_GYM_ID) {
                return { dietPlanTemplates: { items: [], total: 0, limit: 50, offset: 0 } };
            }
            const items = e2eDietPlanTemplates.map(cloneDietTemplate);
            return { dietPlanTemplates: { items, total: items.length, limit: 50, offset: 0 } };
        },

        async getDietPlanTemplate({ accessToken, gymOrgId: _gymOrgId, templateId }) {
            requireStaffToken(accessToken);
            const template = e2eDietPlanTemplates.find((row) => row.id === templateId);
            if (!template) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Template not found', status: 404 });
            }
            return { dietPlanTemplate: cloneDietTemplate(template) };
        },

        async createDietPlanTemplate({ accessToken, gymOrgId: _gymOrgId, body }) {
            requireStaffToken(accessToken);
            const template = templateFromDietWrite(body);
            e2eDietPlanTemplates.push(template);
            return { dietPlanTemplate: cloneDietTemplate(template) };
        },

        async updateDietPlanTemplate({ accessToken, gymOrgId: _gymOrgId, templateId, body }) {
            requireStaffToken(accessToken);
            const index = e2eDietPlanTemplates.findIndex((row) => row.id === templateId);
            if (index < 0) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Template not found', status: 404 });
            }
            const updated = templateFromDietWrite(body);
            updated.id = templateId;
            e2eDietPlanTemplates[index] = updated;
            return { dietPlanTemplate: cloneDietTemplate(updated) };
        },

        async deleteDietPlanTemplate({ accessToken, gymOrgId: _gymOrgId, templateId }) {
            requireStaffToken(accessToken);
            const index = e2eDietPlanTemplates.findIndex((row) => row.id === templateId);
            if (index < 0) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Template not found', status: 404 });
            }
            e2eDietPlanTemplates.splice(index, 1);
        },

        async duplicateDietPlanTemplate({ accessToken, gymOrgId: _gymOrgId, templateId }) {
            requireStaffToken(accessToken);
            const source = e2eDietPlanTemplates.find((row) => row.id === templateId);
            if (!source) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Template not found', status: 404 });
            }
            const copy = cloneDietTemplate(source);
            copy.id = e2eNextId('diet-template-new');
            copy.title = `Copy of ${source.title}`;
            copy.clonedFromId = source.id;
            e2eDietPlanTemplates.push(copy);
            return { dietPlanTemplate: cloneDietTemplate(copy) };
        },

        async listWorkoutPlanTemplates({ accessToken, gymOrgId }) {
            requireStaffToken(accessToken);
            if (gymOrgId !== E2E_GYM_ID) {
                return { workoutPlanTemplates: { items: [], total: 0, limit: 50, offset: 0 } };
            }
            const items = e2eWorkoutPlanTemplates.map(cloneWorkoutTemplate);
            return { workoutPlanTemplates: { items, total: items.length, limit: 50, offset: 0 } };
        },

        async getWorkoutPlanTemplate({ accessToken, gymOrgId: _gymOrgId, templateId }) {
            requireStaffToken(accessToken);
            const template = e2eWorkoutPlanTemplates.find((row) => row.id === templateId);
            if (!template) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Template not found', status: 404 });
            }
            return { workoutPlanTemplate: cloneWorkoutTemplate(template) };
        },

        async createWorkoutPlanTemplate({ accessToken, gymOrgId: _gymOrgId, body }) {
            requireStaffToken(accessToken);
            const template = templateFromWorkoutWrite(body);
            e2eWorkoutPlanTemplates.push(template);
            return { workoutPlanTemplate: cloneWorkoutTemplate(template) };
        },

        async updateWorkoutPlanTemplate({ accessToken, gymOrgId: _gymOrgId, templateId, body }) {
            requireStaffToken(accessToken);
            const index = e2eWorkoutPlanTemplates.findIndex((row) => row.id === templateId);
            if (index < 0) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Template not found', status: 404 });
            }
            const updated = templateFromWorkoutWrite(body);
            updated.id = templateId;
            e2eWorkoutPlanTemplates[index] = updated;
            return { workoutPlanTemplate: cloneWorkoutTemplate(updated) };
        },

        async deleteWorkoutPlanTemplate({ accessToken, gymOrgId: _gymOrgId, templateId }) {
            requireStaffToken(accessToken);
            const index = e2eWorkoutPlanTemplates.findIndex((row) => row.id === templateId);
            if (index < 0) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Template not found', status: 404 });
            }
            e2eWorkoutPlanTemplates.splice(index, 1);
        },

        async duplicateWorkoutPlanTemplate({ accessToken, gymOrgId: _gymOrgId, templateId }) {
            requireStaffToken(accessToken);
            const source = e2eWorkoutPlanTemplates.find((row) => row.id === templateId);
            if (!source) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Template not found', status: 404 });
            }
            const copy = cloneWorkoutTemplate(source);
            copy.id = e2eNextId('workout-template-new');
            copy.title = `Copy of ${source.title}`;
            copy.clonedFromId = source.id;
            e2eWorkoutPlanTemplates.push(copy);
            return { workoutPlanTemplate: cloneWorkoutTemplate(copy) };
        },

        async getClientDietPlan({ accessToken, gymOrgId: _gymOrgId, clientUserId }) {
            requireStaffToken(accessToken);
            const plan = e2eStaffClientDietPlans.get(clientUserId);
            return {
                dietPlan: plan
                    ? { ...plan, meals: plan.meals.map((meal) => ({ ...meal, items: [...meal.items] })) }
                    : null,
            };
        },

        async assignClientDietPlanFromTemplate({ accessToken, gymOrgId: _gymOrgId, clientUserId, templateId }) {
            requireStaffToken(accessToken);
            const template = e2eDietPlanTemplates.find((row) => row.id === templateId);
            if (!template) {
                throw new ApiClientError({ code: 'NOT_FOUND', message: 'Template not found', status: 404 });
            }
            const plan = staffPlanFromTemplate(template);
            e2eStaffClientDietPlans.set(clientUserId, plan);
            return { dietPlan: plan };
        },

        async getClientWorkoutSchedule({ accessToken, gymOrgId, clientUserId, from, to }) {
            requireStaffToken(accessToken);
            const days = (e2eStaffClientWorkoutSchedules.get(staffScheduleKey(gymOrgId, clientUserId)) ?? []).filter(
                (day) => day.scheduleDate >= from && day.scheduleDate <= to,
            );
            const withGrant = hasWorkoutPlansGrant(gymOrgId, clientUserId);
            return {
                days: days.map((day) => ({
                    ...day,
                    sessions: day.sessions.map((session) => ({
                        ...session,
                        exercises: session.exercises.map((exercise) => ({
                            ...exercise,
                            completed: withGrant ? exercise.completed : undefined,
                        })),
                    })),
                    dayDone: withGrant ? day.dayDone : undefined,
                    adherencePercent: withGrant ? day.adherencePercent : undefined,
                })),
            };
        },

        async upsertClientWorkoutSchedule({ accessToken, gymOrgId, clientUserId, entries }) {
            requireStaffToken(accessToken);
            const days = upsertStaffScheduleDays(gymOrgId, clientUserId, entries);
            return { days };
        },

        async getClientWorkoutStreak({ accessToken, gymOrgId, clientUserId }) {
            requireStaffToken(accessToken);
            if (!hasWorkoutPlansGrant(gymOrgId, clientUserId)) {
                throw new ApiClientError({
                    code: 'COACHING_FORBIDDEN',
                    message: 'WORKOUT_PLANS grant required',
                    status: 403,
                });
            }
            const streak = e2eWorkoutStreakByGym.get(gymOrgId);
            if (!streak) {
                return { asOf: isoDateLocal(), currentStreak: 0, longestStreak: 0, lookbackDays: 366 };
            }
            return { ...streak, asOf: isoDateLocal() };
        },
    };
}
