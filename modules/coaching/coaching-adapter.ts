import { z } from 'zod';

import type { HttpClient } from '@/lib/api/client';
import { endpoints } from '@/modules/coaching/coaching-endpoints';
import type {
    CoachingReader,
    CoachingWriter,
    DietPlan,
    DietPlanItem,
    DietPlanMeal,
    ScheduleExercise,
    WorkoutSchedule,
    WorkoutScheduleDay,
    WorkoutSession,
    WorkoutStreak,
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
    };
}
