/**
 * M6/M7 Coaching — Postman "Coaching" folder (CLIENT self-read + STAFF admin).
 *
 * Diet plans and workout schedules are gym-scoped. The web resolves
 * `gymOrgId` from GET /me/gym — never from the client.
 */

import type { MealSlot } from '@/modules/nutrition/nutrition-ports';

// —— Client diet / schedule (self-read) ———————————————————————————————————————

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

// —— Exercise catalog ———————————————————————————————————————————————————————

export type ExerciseIllustration = {
    frames: [string, string, string];
    attribution: string;
};

export type ExerciseItem = {
    id: string;
    name: string;
    aliases: string[];
    primaryMuscle: string;
    equipment: string;
    measurement: string;
    illustration: ExerciseIllustration | null;
};

// —— Diet plan templates (gym library) ————————————————————————————————————————

export type DietTemplateMealItem = {
    id: string;
    foodItemId: string;
    servingId: string;
    quantity: number;
};

export type DietTemplateMeal = {
    id: string;
    mealSlot: MealSlot;
    items: DietTemplateMealItem[];
};

export type DietPlanTemplate = {
    id: string;
    gymOrgId: string;
    trainerId: string;
    title: string;
    notes: string | null;
    clonedFromId: string | null;
    meals: DietTemplateMeal[];
    createdAt: string;
    updatedAt: string;
};

export type DietPlanTemplateWriteMeal = {
    mealSlot: MealSlot;
    items: Array<{ foodItemId: string; servingId: string; quantity: number }>;
};

export type DietPlanTemplateWriteBody = {
    title: string;
    notes?: string | null;
    meals: DietPlanTemplateWriteMeal[];
};

export type PaginatedDietPlanTemplates = {
    items: DietPlanTemplate[];
    total: number;
    limit: number;
    offset: number;
};

// —— Workout plan templates (gym library) ——————————————————————————————————————

export type WorkoutTemplateExercise = {
    id: string;
    exerciseItemId: string;
    name?: string;
    primaryMuscle?: string;
    equipment?: string;
    sets: number | null;
    reps: string | null;
    notes: string | null;
    sortOrder: number;
};

export type WorkoutPlanTemplate = {
    id: string;
    gymOrgId: string;
    trainerId: string;
    title: string;
    notes: string | null;
    clonedFromId: string | null;
    exercises: WorkoutTemplateExercise[];
    createdAt: string;
    updatedAt: string;
};

export type WorkoutTemplateExerciseWrite = {
    exerciseItemId: string;
    sets?: number | null;
    reps?: string | null;
    notes?: string | null;
};

export type WorkoutPlanTemplateWriteBody = {
    title: string;
    notes?: string | null;
    exercises: WorkoutTemplateExerciseWrite[];
};

export type PaginatedWorkoutPlanTemplates = {
    items: WorkoutPlanTemplate[];
    total: number;
    limit: number;
    offset: number;
};

// —— Staff client coaching ————————————————————————————————————————————————————

export type StaffDietPlanItem = {
    id: string;
    foodItemId: string;
    servingId: string;
    quantity: number;
    mealSlot: MealSlot;
};

export type StaffDietPlanMeal = {
    id: string;
    mealSlot: MealSlot;
    items: StaffDietPlanItem[];
};

/** Staff read — no `logged` flags; `writable` is always false. */
export type StaffDietPlan = {
    id: string;
    title: string;
    notes: string | null;
    status: string;
    writable: boolean;
    meals: StaffDietPlanMeal[];
};

export type StaffScheduleExercise = {
    id: string;
    exerciseItemId: string;
    name: string;
    sets: number;
    reps: string;
    notes: string | null;
    sortOrder: number;
    completed?: boolean;
};

export type StaffWorkoutSession = {
    id: string;
    slot: WorkoutSessionSlot;
    title: string;
    clonedFromTemplateId: string | null;
    exercises: StaffScheduleExercise[];
};

export type StaffWorkoutScheduleDay = {
    id: string;
    clientUserId: string;
    gymOrgId: string;
    trainerId: string;
    scheduleDate: string;
    kind: WorkoutScheduleKind;
    morningTemplateId: string | null;
    eveningTemplateId: string | null;
    sessions: StaffWorkoutSession[];
    dayDone?: boolean;
    adherencePercent?: number | null;
    createdAt: string;
    updatedAt: string;
};

export type WorkoutScheduleUpsertEntry = {
    date: string;
    kind: WorkoutScheduleKind;
    morningTemplateId?: string;
    eveningTemplateId?: string;
};

// —— Ports ————————————————————————————————————————————————————————————————————

export type CoachingReader = {
    getMyDietPlan: (input: { accessToken: string; gymOrgId: string }) => Promise<{ dietPlan: DietPlan | null }>;
    getMyWorkoutSchedule: (input: {
        accessToken: string;
        gymOrgId: string;
        from: string;
        to: string;
    }) => Promise<WorkoutSchedule>;
    getMyWorkoutStreak: (input: { accessToken: string; gymOrgId: string }) => Promise<WorkoutStreak>;
    searchExercises: (input: { accessToken: string; query: string }) => Promise<{ exercises: ExerciseItem[] }>;
    listDietPlanTemplates: (input: {
        accessToken: string;
        gymOrgId: string;
        limit?: number;
        offset?: number;
    }) => Promise<{ dietPlanTemplates: PaginatedDietPlanTemplates }>;
    getDietPlanTemplate: (input: {
        accessToken: string;
        gymOrgId: string;
        templateId: string;
    }) => Promise<{ dietPlanTemplate: DietPlanTemplate }>;
    listWorkoutPlanTemplates: (input: {
        accessToken: string;
        gymOrgId: string;
        limit?: number;
        offset?: number;
    }) => Promise<{ workoutPlanTemplates: PaginatedWorkoutPlanTemplates }>;
    getWorkoutPlanTemplate: (input: {
        accessToken: string;
        gymOrgId: string;
        templateId: string;
    }) => Promise<{ workoutPlanTemplate: WorkoutPlanTemplate }>;
    getClientDietPlan: (input: {
        accessToken: string;
        gymOrgId: string;
        clientUserId: string;
    }) => Promise<{ dietPlan: StaffDietPlan | null }>;
    getClientWorkoutSchedule: (input: {
        accessToken: string;
        gymOrgId: string;
        clientUserId: string;
        from: string;
        to: string;
    }) => Promise<{ days: StaffWorkoutScheduleDay[] }>;
    getClientWorkoutStreak: (input: {
        accessToken: string;
        gymOrgId: string;
        clientUserId: string;
    }) => Promise<WorkoutStreak>;
};

export type CoachingWriter = {
    completeDietItem: (input: { accessToken: string; gymOrgId: string; itemId: string }) => Promise<void>;
    uncompleteDietItem: (input: { accessToken: string; gymOrgId: string; itemId: string }) => Promise<void>;
    completeScheduleExercise: (input: { accessToken: string; gymOrgId: string; itemId: string }) => Promise<void>;
    uncompleteScheduleExercise: (input: { accessToken: string; gymOrgId: string; itemId: string }) => Promise<void>;
    createDietPlanTemplate: (input: {
        accessToken: string;
        gymOrgId: string;
        body: DietPlanTemplateWriteBody;
    }) => Promise<{ dietPlanTemplate: DietPlanTemplate }>;
    updateDietPlanTemplate: (input: {
        accessToken: string;
        gymOrgId: string;
        templateId: string;
        body: DietPlanTemplateWriteBody;
    }) => Promise<{ dietPlanTemplate: DietPlanTemplate }>;
    deleteDietPlanTemplate: (input: { accessToken: string; gymOrgId: string; templateId: string }) => Promise<void>;
    duplicateDietPlanTemplate: (input: {
        accessToken: string;
        gymOrgId: string;
        templateId: string;
    }) => Promise<{ dietPlanTemplate: DietPlanTemplate }>;
    createWorkoutPlanTemplate: (input: {
        accessToken: string;
        gymOrgId: string;
        body: WorkoutPlanTemplateWriteBody;
    }) => Promise<{ workoutPlanTemplate: WorkoutPlanTemplate }>;
    updateWorkoutPlanTemplate: (input: {
        accessToken: string;
        gymOrgId: string;
        templateId: string;
        body: WorkoutPlanTemplateWriteBody;
    }) => Promise<{ workoutPlanTemplate: WorkoutPlanTemplate }>;
    deleteWorkoutPlanTemplate: (input: { accessToken: string; gymOrgId: string; templateId: string }) => Promise<void>;
    duplicateWorkoutPlanTemplate: (input: {
        accessToken: string;
        gymOrgId: string;
        templateId: string;
    }) => Promise<{ workoutPlanTemplate: WorkoutPlanTemplate }>;
    assignClientDietPlanFromTemplate: (input: {
        accessToken: string;
        gymOrgId: string;
        clientUserId: string;
        templateId: string;
        title?: string;
        notes?: string | null;
    }) => Promise<{ dietPlan: StaffDietPlan }>;
    upsertClientWorkoutSchedule: (input: {
        accessToken: string;
        gymOrgId: string;
        clientUserId: string;
        entries: WorkoutScheduleUpsertEntry[];
    }) => Promise<{ days: StaffWorkoutScheduleDay[] }>;
};
