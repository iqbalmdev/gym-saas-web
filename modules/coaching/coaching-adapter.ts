import { z } from 'zod';

import type { HttpClient } from '@/lib/api/client';
import { endpoints } from '@/modules/coaching/coaching-endpoints';
import type {
    CoachingReader,
    CoachingWriter,
    DietPlan,
    DietPlanItem,
    DietPlanMeal,
    DietPlanTemplate,
    DietTemplateMeal,
    DietTemplateMealItem,
    ExerciseItem,
    PaginatedDietPlanTemplates,
    PaginatedWorkoutPlanTemplates,
    ScheduleExercise,
    StaffDietPlan,
    StaffDietPlanItem,
    StaffDietPlanMeal,
    StaffScheduleExercise,
    StaffWorkoutScheduleDay,
    StaffWorkoutSession,
    WorkoutPlanTemplate,
    WorkoutSchedule,
    WorkoutScheduleDay,
    WorkoutSession,
    WorkoutStreak,
    WorkoutTemplateExercise,
} from '@/modules/coaching/coaching-ports';

const numberish = z.preprocess((value) => {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : value;
    }
    return value;
}, z.number());

const mealSlotSchema = z.enum(['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'EVENING_SNACK', 'DINNER']);
const scheduleKindSchema = z.enum(['REST', 'TRAINING']);
const sessionSlotSchema = z.enum(['MORNING', 'EVENING']);

const dietPlanItemSchema = z.object({
    id: z.string().min(1),
    foodItemId: z.string().min(1),
    servingId: z.string().min(1),
    quantity: numberish,
    mealSlot: mealSlotSchema,
    logged: z.coerce.boolean(),
});

const dietPlanMealSchema = z.object({
    id: z.string().min(1),
    mealSlot: mealSlotSchema,
    items: z.array(z.unknown()),
});

const dietPlanSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    notes: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    status: z.string().min(1),
    writable: z.coerce.boolean(),
    logDate: z.string().min(1),
    meals: z.array(z.unknown()),
});

const dietPlanEnvelopeSchema = z.object({
    dietPlan: z.unknown().nullable(),
});

const scheduleExerciseSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    sets: numberish,
    reps: z.string().min(1),
    completed: z.coerce.boolean(),
});

const workoutSessionSchema = z.object({
    id: z.string().min(1),
    slot: sessionSlotSchema,
    title: z.string().min(1),
    exercises: z.array(z.unknown()),
});

const scheduleDaySchema = z.object({
    scheduleDate: z.string().min(1),
    kind: scheduleKindSchema,
    dayDone: z.coerce.boolean(),
    adherencePercent: numberish.nullable(),
    sessions: z.array(z.unknown()),
});

const workoutScheduleSchema = z.object({
    today: z.string().min(1),
    writable: z.coerce.boolean(),
    days: z.array(z.unknown()),
});

const workoutStreakSchema = z.object({
    asOf: z.string().min(1),
    currentStreak: numberish,
    longestStreak: numberish,
    lookbackDays: numberish,
});

function normalizeDietItem(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        foodItemId: row.foodItemId ?? row.food_item_id,
        servingId: row.servingId ?? row.serving_id,
        quantity: row.quantity,
        mealSlot: row.mealSlot ?? row.meal_slot,
        logged: row.logged,
    };
}

function normalizeDietMeal(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        mealSlot: row.mealSlot ?? row.meal_slot,
        items: row.items ?? [],
    };
}

function normalizeDietPlan(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        title: row.title,
        notes: row.notes,
        status: row.status,
        writable: row.writable,
        logDate: row.logDate ?? row.log_date,
        meals: row.meals ?? [],
    };
}

function normalizeExercise(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        name: row.name,
        sets: row.sets,
        reps: row.reps,
        completed: row.completed,
    };
}

function normalizeSession(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        slot: row.slot,
        title: row.title,
        exercises: row.exercises ?? [],
    };
}

function normalizeScheduleDay(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        scheduleDate: row.scheduleDate ?? row.schedule_date,
        kind: row.kind,
        dayDone: row.dayDone ?? row.day_done,
        adherencePercent: row.adherencePercent ?? row.adherence_percent ?? null,
        sessions: row.sessions ?? [],
    };
}

function toDietItem(raw: unknown): DietPlanItem {
    const parsed = dietPlanItemSchema.parse(normalizeDietItem(raw));
    return {
        id: parsed.id,
        foodItemId: parsed.foodItemId,
        servingId: parsed.servingId,
        quantity: parsed.quantity,
        mealSlot: parsed.mealSlot,
        logged: parsed.logged,
    };
}

function toDietMeal(raw: unknown): DietPlanMeal {
    const parsed = dietPlanMealSchema.parse(normalizeDietMeal(raw));
    return {
        id: parsed.id,
        mealSlot: parsed.mealSlot,
        items: parsed.items.map(toDietItem),
    };
}

function toDietPlan(raw: unknown): DietPlan {
    const parsed = dietPlanSchema.parse(normalizeDietPlan(raw));
    return {
        id: parsed.id,
        title: parsed.title,
        notes: parsed.notes,
        status: parsed.status,
        writable: parsed.writable,
        logDate: parsed.logDate,
        meals: parsed.meals.map(toDietMeal),
    };
}

function toExercise(raw: unknown): ScheduleExercise {
    const parsed = scheduleExerciseSchema.parse(normalizeExercise(raw));
    return {
        id: parsed.id,
        name: parsed.name,
        sets: parsed.sets,
        reps: parsed.reps,
        completed: parsed.completed,
    };
}

function toSession(raw: unknown): WorkoutSession {
    const parsed = workoutSessionSchema.parse(normalizeSession(raw));
    return {
        id: parsed.id,
        slot: parsed.slot,
        title: parsed.title,
        exercises: parsed.exercises.map(toExercise),
    };
}

function toScheduleDay(raw: unknown): WorkoutScheduleDay {
    const parsed = scheduleDaySchema.parse(normalizeScheduleDay(raw));
    return {
        scheduleDate: parsed.scheduleDate,
        kind: parsed.kind,
        dayDone: parsed.dayDone,
        adherencePercent: parsed.adherencePercent,
        sessions: parsed.sessions.map(toSession),
    };
}

function toWorkoutSchedule(raw: unknown): WorkoutSchedule {
    const parsed = workoutScheduleSchema.parse(raw);
    return {
        today: parsed.today,
        writable: parsed.writable,
        days: parsed.days.map(toScheduleDay),
    };
}

function toWorkoutStreak(raw: unknown): WorkoutStreak {
    const parsed = workoutStreakSchema.parse(raw);
    return {
        asOf: parsed.asOf,
        currentStreak: parsed.currentStreak,
        longestStreak: parsed.longestStreak,
        lookbackDays: parsed.lookbackDays,
    };
}

function scheduleQuery(from: string, to: string): string {
    const params = new URLSearchParams({ from, to });
    return `?${params.toString()}`;
}

function paginationQuery(limit?: number, offset?: number): string {
    const params = new URLSearchParams();
    if (limit !== undefined) {
        params.set('limit', String(limit));
    }
    if (offset !== undefined) {
        params.set('offset', String(offset));
    }
    const query = params.toString();
    return query ? `?${query}` : '';
}

const exerciseItemSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    aliases: z.array(z.string()).default([]),
    primaryMuscle: z.string().min(1),
    equipment: z.string().min(1),
    measurement: z.string().min(1),
    illustration: z.unknown().nullable(),
});

const dietTemplateItemSchema = z.object({
    id: z.string().min(1),
    foodItemId: z.string().min(1),
    servingId: z.string().min(1),
    quantity: numberish,
});

const dietTemplateMealSchema = z.object({
    id: z.string().min(1),
    mealSlot: mealSlotSchema,
    items: z.array(z.unknown()),
});

const dietPlanTemplateSchema = z.object({
    id: z.string().min(1),
    gymOrgId: z.string().min(1),
    trainerId: z.string().min(1),
    title: z.string().min(1),
    notes: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    clonedFromId: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    meals: z.array(z.unknown()),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});

const paginatedDietTemplatesSchema = z.object({
    items: z.array(z.unknown()),
    total: numberish,
    limit: numberish,
    offset: numberish,
});

const workoutTemplateExerciseSchema = z.object({
    id: z.string().min(1),
    exerciseItemId: z.string().min(1),
    name: z.string().optional(),
    primaryMuscle: z.string().optional(),
    equipment: z.string().optional(),
    sets: numberish.nullable(),
    reps: z.string().nullable(),
    notes: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    sortOrder: numberish,
});

const workoutPlanTemplateSchema = z.object({
    id: z.string().min(1),
    gymOrgId: z.string().min(1),
    trainerId: z.string().min(1),
    title: z.string().min(1),
    notes: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    clonedFromId: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    exercises: z.array(z.unknown()),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});

const paginatedWorkoutTemplatesSchema = z.object({
    items: z.array(z.unknown()),
    total: numberish,
    limit: numberish,
    offset: numberish,
});

const staffDietItemSchema = z.object({
    id: z.string().min(1),
    foodItemId: z.string().min(1),
    servingId: z.string().min(1),
    quantity: numberish,
    mealSlot: mealSlotSchema,
});

const staffDietMealSchema = z.object({
    id: z.string().min(1),
    mealSlot: mealSlotSchema,
    items: z.array(z.unknown()),
});

const staffDietPlanSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    notes: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    status: z.string().min(1),
    writable: z.coerce.boolean(),
    meals: z.array(z.unknown()),
});

const staffScheduleExerciseSchema = z.object({
    id: z.string().min(1),
    exerciseItemId: z.string().min(1),
    name: z.string().min(1),
    sets: numberish,
    reps: z.string().min(1),
    notes: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    sortOrder: numberish,
    completed: z.coerce.boolean().optional(),
});

const staffSessionSchema = z.object({
    id: z.string().min(1),
    slot: sessionSlotSchema,
    title: z.string().min(1),
    clonedFromTemplateId: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    exercises: z.array(z.unknown()),
});

const staffScheduleDaySchema = z.object({
    id: z.string().min(1),
    clientUserId: z.string().min(1),
    gymOrgId: z.string().min(1),
    trainerId: z.string().min(1),
    scheduleDate: z.string().min(1),
    kind: scheduleKindSchema,
    morningTemplateId: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    eveningTemplateId: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    sessions: z.array(z.unknown()),
    dayDone: z.coerce.boolean().optional(),
    adherencePercent: numberish.nullable().optional(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});

function normalizeTemplateItem(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        foodItemId: row.foodItemId ?? row.food_item_id,
        servingId: row.servingId ?? row.serving_id,
        quantity: row.quantity,
    };
}

function normalizeTemplateMeal(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        mealSlot: row.mealSlot ?? row.meal_slot,
        items: row.items ?? [],
    };
}

function normalizeDietTemplate(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        gymOrgId: row.gymOrgId ?? row.gym_org_id,
        trainerId: row.trainerId ?? row.trainer_id,
        title: row.title,
        notes: row.notes,
        clonedFromId: row.clonedFromId ?? row.cloned_from_id ?? null,
        meals: row.meals ?? [],
        createdAt: row.createdAt ?? row.created_at,
        updatedAt: row.updatedAt ?? row.updated_at,
    };
}

function normalizeWorkoutTemplateExercise(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        exerciseItemId: row.exerciseItemId ?? row.exercise_item_id,
        name: row.name,
        primaryMuscle: row.primaryMuscle ?? row.primary_muscle,
        equipment: row.equipment,
        sets: row.sets,
        reps: row.reps,
        notes: row.notes,
        sortOrder: row.sortOrder ?? row.sort_order,
    };
}

function normalizeWorkoutTemplate(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        gymOrgId: row.gymOrgId ?? row.gym_org_id,
        trainerId: row.trainerId ?? row.trainer_id,
        title: row.title,
        notes: row.notes,
        clonedFromId: row.clonedFromId ?? row.cloned_from_id ?? null,
        exercises: row.exercises ?? [],
        createdAt: row.createdAt ?? row.created_at,
        updatedAt: row.updatedAt ?? row.updated_at,
    };
}

function normalizeStaffScheduleExercise(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        exerciseItemId: row.exerciseItemId ?? row.exercise_item_id,
        name: row.name,
        sets: row.sets,
        reps: row.reps,
        notes: row.notes,
        sortOrder: row.sortOrder ?? row.sort_order,
        completed: row.completed,
    };
}

function normalizeStaffSession(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        slot: row.slot,
        title: row.title,
        clonedFromTemplateId: row.clonedFromTemplateId ?? row.cloned_from_template_id ?? null,
        exercises: row.exercises ?? [],
    };
}

function normalizeStaffScheduleDay(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') {
        return raw;
    }
    const row = raw as Record<string, unknown>;
    return {
        id: row.id,
        clientUserId: row.clientUserId ?? row.client_user_id,
        gymOrgId: row.gymOrgId ?? row.gym_org_id,
        trainerId: row.trainerId ?? row.trainer_id,
        scheduleDate: row.scheduleDate ?? row.schedule_date,
        kind: row.kind,
        morningTemplateId: row.morningTemplateId ?? row.morning_template_id ?? null,
        eveningTemplateId: row.eveningTemplateId ?? row.evening_template_id ?? null,
        sessions: row.sessions ?? [],
        dayDone: row.dayDone ?? row.day_done,
        adherencePercent: row.adherencePercent ?? row.adherence_percent,
        createdAt: row.createdAt ?? row.created_at,
        updatedAt: row.updatedAt ?? row.updated_at,
    };
}

function toExerciseItem(raw: unknown): ExerciseItem {
    const parsed = exerciseItemSchema.parse(raw);
    const illustration = parsed.illustration;
    return {
        id: parsed.id,
        name: parsed.name,
        aliases: parsed.aliases,
        primaryMuscle: parsed.primaryMuscle,
        equipment: parsed.equipment,
        measurement: parsed.measurement,
        illustration:
            illustration && typeof illustration === 'object' ? (illustration as ExerciseItem['illustration']) : null,
    };
}

function toDietTemplateItem(raw: unknown): DietTemplateMealItem {
    const parsed = dietTemplateItemSchema.parse(normalizeTemplateItem(raw));
    return {
        id: parsed.id,
        foodItemId: parsed.foodItemId,
        servingId: parsed.servingId,
        quantity: parsed.quantity,
    };
}

function toDietTemplateMeal(raw: unknown): DietTemplateMeal {
    const parsed = dietTemplateMealSchema.parse(normalizeTemplateMeal(raw));
    return {
        id: parsed.id,
        mealSlot: parsed.mealSlot,
        items: parsed.items.map(toDietTemplateItem),
    };
}

function toDietPlanTemplate(raw: unknown): DietPlanTemplate {
    const parsed = dietPlanTemplateSchema.parse(normalizeDietTemplate(raw));
    return {
        id: parsed.id,
        gymOrgId: parsed.gymOrgId,
        trainerId: parsed.trainerId,
        title: parsed.title,
        notes: parsed.notes,
        clonedFromId: parsed.clonedFromId,
        meals: parsed.meals.map(toDietTemplateMeal),
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt,
    };
}

function toPaginatedDietTemplates(raw: unknown): PaginatedDietPlanTemplates {
    const parsed = paginatedDietTemplatesSchema.parse(raw);
    return {
        items: parsed.items.map(toDietPlanTemplate),
        total: parsed.total,
        limit: parsed.limit,
        offset: parsed.offset,
    };
}

function toWorkoutTemplateExercise(raw: unknown): WorkoutTemplateExercise {
    const parsed = workoutTemplateExerciseSchema.parse(normalizeWorkoutTemplateExercise(raw));
    return {
        id: parsed.id,
        exerciseItemId: parsed.exerciseItemId,
        name: parsed.name,
        primaryMuscle: parsed.primaryMuscle,
        equipment: parsed.equipment,
        sets: parsed.sets,
        reps: parsed.reps,
        notes: parsed.notes,
        sortOrder: parsed.sortOrder,
    };
}

function toWorkoutPlanTemplate(raw: unknown): WorkoutPlanTemplate {
    const parsed = workoutPlanTemplateSchema.parse(normalizeWorkoutTemplate(raw));
    return {
        id: parsed.id,
        gymOrgId: parsed.gymOrgId,
        trainerId: parsed.trainerId,
        title: parsed.title,
        notes: parsed.notes,
        clonedFromId: parsed.clonedFromId,
        exercises: parsed.exercises.map(toWorkoutTemplateExercise),
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt,
    };
}

function toPaginatedWorkoutTemplates(raw: unknown): PaginatedWorkoutPlanTemplates {
    const parsed = paginatedWorkoutTemplatesSchema.parse(raw);
    return {
        items: parsed.items.map(toWorkoutPlanTemplate),
        total: parsed.total,
        limit: parsed.limit,
        offset: parsed.offset,
    };
}

function toStaffDietItem(raw: unknown): StaffDietPlanItem {
    const parsed = staffDietItemSchema.parse(normalizeDietItem(raw));
    return {
        id: parsed.id,
        foodItemId: parsed.foodItemId,
        servingId: parsed.servingId,
        quantity: parsed.quantity,
        mealSlot: parsed.mealSlot,
    };
}

function toStaffDietMeal(raw: unknown): StaffDietPlanMeal {
    const parsed = staffDietMealSchema.parse(normalizeDietMeal(raw));
    return {
        id: parsed.id,
        mealSlot: parsed.mealSlot,
        items: parsed.items.map(toStaffDietItem),
    };
}

function toStaffDietPlan(raw: unknown): StaffDietPlan {
    const parsed = staffDietPlanSchema.parse(normalizeDietPlan(raw));
    return {
        id: parsed.id,
        title: parsed.title,
        notes: parsed.notes,
        status: parsed.status,
        writable: parsed.writable,
        meals: parsed.meals.map(toStaffDietMeal),
    };
}

function toStaffScheduleExercise(raw: unknown): StaffScheduleExercise {
    const parsed = staffScheduleExerciseSchema.parse(normalizeStaffScheduleExercise(raw));
    return {
        id: parsed.id,
        exerciseItemId: parsed.exerciseItemId,
        name: parsed.name,
        sets: parsed.sets,
        reps: parsed.reps,
        notes: parsed.notes,
        sortOrder: parsed.sortOrder,
        completed: parsed.completed,
    };
}

function toStaffSession(raw: unknown): StaffWorkoutSession {
    const parsed = staffSessionSchema.parse(normalizeStaffSession(raw));
    return {
        id: parsed.id,
        slot: parsed.slot,
        title: parsed.title,
        clonedFromTemplateId: parsed.clonedFromTemplateId,
        exercises: parsed.exercises.map(toStaffScheduleExercise),
    };
}

function toStaffScheduleDay(raw: unknown): StaffWorkoutScheduleDay {
    const parsed = staffScheduleDaySchema.parse(normalizeStaffScheduleDay(raw));
    return {
        id: parsed.id,
        clientUserId: parsed.clientUserId,
        gymOrgId: parsed.gymOrgId,
        trainerId: parsed.trainerId,
        scheduleDate: parsed.scheduleDate,
        kind: parsed.kind,
        morningTemplateId: parsed.morningTemplateId,
        eveningTemplateId: parsed.eveningTemplateId,
        sessions: parsed.sessions.map(toStaffSession),
        dayDone: parsed.dayDone,
        adherencePercent: parsed.adherencePercent,
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt,
    };
}

export function createCoachingAdapter(http: HttpClient): CoachingReader & CoachingWriter {
    return {
        async getMyDietPlan({ accessToken, gymOrgId }) {
            const raw = await http.request<unknown>({
                path: endpoints.myDietPlan(gymOrgId),
                method: 'GET',
                accessToken,
            });
            const parsed = dietPlanEnvelopeSchema.parse(raw);
            return { dietPlan: parsed.dietPlan ? toDietPlan(parsed.dietPlan) : null };
        },

        async getMyWorkoutSchedule({ accessToken, gymOrgId, from, to }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.myWorkoutSchedule(gymOrgId)}${scheduleQuery(from, to)}`,
                method: 'GET',
                accessToken,
            });
            return toWorkoutSchedule(raw);
        },

        async getMyWorkoutStreak({ accessToken, gymOrgId }) {
            const raw = await http.request<unknown>({
                path: endpoints.myWorkoutStreak(gymOrgId),
                method: 'GET',
                accessToken,
            });
            return toWorkoutStreak(raw);
        },

        async completeDietItem({ accessToken, gymOrgId, itemId }) {
            await http.request<null>({
                path: endpoints.myDietPlanItemComplete(gymOrgId, itemId),
                method: 'POST',
                accessToken,
            });
        },

        async uncompleteDietItem({ accessToken, gymOrgId, itemId }) {
            await http.request<null>({
                path: endpoints.myDietPlanItemComplete(gymOrgId, itemId),
                method: 'DELETE',
                accessToken,
            });
        },

        async completeScheduleExercise({ accessToken, gymOrgId, itemId }) {
            await http.request<null>({
                path: endpoints.myWorkoutScheduleItemComplete(gymOrgId, itemId),
                method: 'POST',
                accessToken,
            });
        },

        async uncompleteScheduleExercise({ accessToken, gymOrgId, itemId }) {
            await http.request<null>({
                path: endpoints.myWorkoutScheduleItemComplete(gymOrgId, itemId),
                method: 'DELETE',
                accessToken,
            });
        },

        async searchExercises({ accessToken, query }) {
            const params = new URLSearchParams({ q: query });
            const raw = await http.request<unknown>({
                path: `${endpoints.exercisesSearch()}?${params.toString()}`,
                method: 'GET',
                accessToken,
            });
            const parsed = z.object({ exercises: z.array(z.unknown()) }).parse(raw);
            return { exercises: parsed.exercises.map(toExerciseItem) };
        },

        async listDietPlanTemplates({ accessToken, gymOrgId, limit, offset }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.dietPlanTemplates(gymOrgId)}${paginationQuery(limit, offset)}`,
                method: 'GET',
                accessToken,
            });
            const parsed = z.object({ dietPlanTemplates: z.unknown() }).parse(raw);
            return { dietPlanTemplates: toPaginatedDietTemplates(parsed.dietPlanTemplates) };
        },

        async getDietPlanTemplate({ accessToken, gymOrgId, templateId }) {
            const raw = await http.request<unknown>({
                path: endpoints.dietPlanTemplate(gymOrgId, templateId),
                method: 'GET',
                accessToken,
            });
            const parsed = z.object({ dietPlanTemplate: z.unknown() }).parse(raw);
            return { dietPlanTemplate: toDietPlanTemplate(parsed.dietPlanTemplate) };
        },

        async createDietPlanTemplate({ accessToken, gymOrgId, body }) {
            const raw = await http.request<unknown>({
                path: endpoints.dietPlanTemplates(gymOrgId),
                method: 'POST',
                accessToken,
                body,
            });
            const parsed = z.object({ dietPlanTemplate: z.unknown() }).parse(raw);
            return { dietPlanTemplate: toDietPlanTemplate(parsed.dietPlanTemplate) };
        },

        async updateDietPlanTemplate({ accessToken, gymOrgId, templateId, body }) {
            const raw = await http.request<unknown>({
                path: endpoints.dietPlanTemplate(gymOrgId, templateId),
                method: 'PATCH',
                accessToken,
                body,
            });
            const parsed = z.object({ dietPlanTemplate: z.unknown() }).parse(raw);
            return { dietPlanTemplate: toDietPlanTemplate(parsed.dietPlanTemplate) };
        },

        async deleteDietPlanTemplate({ accessToken, gymOrgId, templateId }) {
            await http.request<null>({
                path: endpoints.dietPlanTemplate(gymOrgId, templateId),
                method: 'DELETE',
                accessToken,
            });
        },

        async duplicateDietPlanTemplate({ accessToken, gymOrgId, templateId }) {
            const raw = await http.request<unknown>({
                path: endpoints.dietPlanTemplateDuplicate(gymOrgId, templateId),
                method: 'POST',
                accessToken,
            });
            const parsed = z.object({ dietPlanTemplate: z.unknown() }).parse(raw);
            return { dietPlanTemplate: toDietPlanTemplate(parsed.dietPlanTemplate) };
        },

        async listWorkoutPlanTemplates({ accessToken, gymOrgId, limit, offset }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.workoutPlanTemplates(gymOrgId)}${paginationQuery(limit, offset)}`,
                method: 'GET',
                accessToken,
            });
            const parsed = z.object({ workoutPlanTemplates: z.unknown() }).parse(raw);
            return { workoutPlanTemplates: toPaginatedWorkoutTemplates(parsed.workoutPlanTemplates) };
        },

        async getWorkoutPlanTemplate({ accessToken, gymOrgId, templateId }) {
            const raw = await http.request<unknown>({
                path: endpoints.workoutPlanTemplate(gymOrgId, templateId),
                method: 'GET',
                accessToken,
            });
            const parsed = z.object({ workoutPlanTemplate: z.unknown() }).parse(raw);
            return { workoutPlanTemplate: toWorkoutPlanTemplate(parsed.workoutPlanTemplate) };
        },

        async createWorkoutPlanTemplate({ accessToken, gymOrgId, body }) {
            const raw = await http.request<unknown>({
                path: endpoints.workoutPlanTemplates(gymOrgId),
                method: 'POST',
                accessToken,
                body,
            });
            const parsed = z.object({ workoutPlanTemplate: z.unknown() }).parse(raw);
            return { workoutPlanTemplate: toWorkoutPlanTemplate(parsed.workoutPlanTemplate) };
        },

        async updateWorkoutPlanTemplate({ accessToken, gymOrgId, templateId, body }) {
            const raw = await http.request<unknown>({
                path: endpoints.workoutPlanTemplate(gymOrgId, templateId),
                method: 'PATCH',
                accessToken,
                body,
            });
            const parsed = z.object({ workoutPlanTemplate: z.unknown() }).parse(raw);
            return { workoutPlanTemplate: toWorkoutPlanTemplate(parsed.workoutPlanTemplate) };
        },

        async deleteWorkoutPlanTemplate({ accessToken, gymOrgId, templateId }) {
            await http.request<null>({
                path: endpoints.workoutPlanTemplate(gymOrgId, templateId),
                method: 'DELETE',
                accessToken,
            });
        },

        async duplicateWorkoutPlanTemplate({ accessToken, gymOrgId, templateId }) {
            const raw = await http.request<unknown>({
                path: endpoints.workoutPlanTemplateDuplicate(gymOrgId, templateId),
                method: 'POST',
                accessToken,
            });
            const parsed = z.object({ workoutPlanTemplate: z.unknown() }).parse(raw);
            return { workoutPlanTemplate: toWorkoutPlanTemplate(parsed.workoutPlanTemplate) };
        },

        async getClientDietPlan({ accessToken, gymOrgId, clientUserId }) {
            const raw = await http.request<unknown>({
                path: endpoints.clientDietPlans(gymOrgId, clientUserId),
                method: 'GET',
                accessToken,
            });
            const parsed = z.object({ dietPlan: z.unknown().nullable() }).parse(raw);
            return { dietPlan: parsed.dietPlan ? toStaffDietPlan(parsed.dietPlan) : null };
        },

        async assignClientDietPlanFromTemplate({ accessToken, gymOrgId, clientUserId, templateId, title, notes }) {
            const raw = await http.request<unknown>({
                path: endpoints.clientDietPlans(gymOrgId, clientUserId),
                method: 'POST',
                accessToken,
                body: {
                    templateId,
                    ...(title !== undefined ? { title } : {}),
                    ...(notes !== undefined ? { notes } : {}),
                },
            });
            const parsed = z.object({ dietPlan: z.unknown() }).parse(raw);
            return { dietPlan: toStaffDietPlan(parsed.dietPlan) };
        },

        async getClientWorkoutSchedule({ accessToken, gymOrgId, clientUserId, from, to }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.clientWorkoutSchedule(gymOrgId, clientUserId)}${scheduleQuery(from, to)}`,
                method: 'GET',
                accessToken,
            });
            const parsed = z.object({ days: z.array(z.unknown()) }).parse(raw);
            return { days: parsed.days.map(toStaffScheduleDay) };
        },

        async upsertClientWorkoutSchedule({ accessToken, gymOrgId, clientUserId, entries }) {
            const raw = await http.request<unknown>({
                path: endpoints.clientWorkoutSchedule(gymOrgId, clientUserId),
                method: 'PUT',
                accessToken,
                body: { entries },
            });
            const parsed = z.object({ days: z.array(z.unknown()) }).parse(raw);
            return { days: parsed.days.map(toStaffScheduleDay) };
        },

        async getClientWorkoutStreak({ accessToken, gymOrgId, clientUserId }) {
            const raw = await http.request<unknown>({
                path: endpoints.clientWorkoutStreak(gymOrgId, clientUserId),
                method: 'GET',
                accessToken,
            });
            return toWorkoutStreak(raw);
        },
    };
}
