/**
 * M6/M7 Coaching — Postman "Coaching" folder (CLIENT self-read + completions).
 *
 * Diet plans and workout schedules are gym-scoped. The web resolves
 * `gymOrgId` from GET /me/gym — never from the client.
 */

import type { MealSlot } from '@/modules/nutrition/nutrition-ports';

export type DietPlanItem = {
    id: string;
    foodItemId: string;
    servingId: string;
    quantity: number;
    mealSlot: MealSlot;
    logged: boolean;
};

export type DietPlanMeal = {
    id: string;
    mealSlot: MealSlot;
    items: DietPlanItem[];
};

export type DietPlan = {
    id: string;
    title: string;
    notes: string | null;
    status: string;
    writable: boolean;
    logDate: string;
    meals: DietPlanMeal[];
};

export type WorkoutScheduleKind = 'REST' | 'TRAINING';
export type WorkoutSessionSlot = 'MORNING' | 'EVENING';

export type ScheduleExercise = {
    id: string;
    name: string;
    sets: number;
    reps: string;
    completed: boolean;
};

export type WorkoutSession = {
    id: string;
    slot: WorkoutSessionSlot;
    title: string;
    exercises: ScheduleExercise[];
};

export type WorkoutScheduleDay = {
    scheduleDate: string;
    kind: WorkoutScheduleKind;
    dayDone: boolean;
    adherencePercent: number | null;
    sessions: WorkoutSession[];
};

export type WorkoutSchedule = {
    today: string;
    writable: boolean;
    days: WorkoutScheduleDay[];
};

export type WorkoutStreak = {
    asOf: string;
    currentStreak: number;
    longestStreak: number;
    lookbackDays: number;
};

export type CoachingReader = {
    getMyDietPlan: (input: { accessToken: string; gymOrgId: string }) => Promise<{ dietPlan: DietPlan | null }>;
    getMyWorkoutSchedule: (input: {
        accessToken: string;
        gymOrgId: string;
        from: string;
        to: string;
    }) => Promise<WorkoutSchedule>;
    getMyWorkoutStreak: (input: { accessToken: string; gymOrgId: string }) => Promise<WorkoutStreak>;
};

export type CoachingWriter = {
    completeDietItem: (input: { accessToken: string; gymOrgId: string; itemId: string }) => Promise<void>;
    uncompleteDietItem: (input: { accessToken: string; gymOrgId: string; itemId: string }) => Promise<void>;
    completeScheduleExercise: (input: { accessToken: string; gymOrgId: string; itemId: string }) => Promise<void>;
    uncompleteScheduleExercise: (input: { accessToken: string; gymOrgId: string; itemId: string }) => Promise<void>;
};
