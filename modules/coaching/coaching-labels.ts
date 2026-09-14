import type { MealSlot } from '@/modules/nutrition/nutrition-ports';
import { mealSlotLabel as nutritionMealSlotLabel } from '@/modules/nutrition/nutrition-labels';

import type { WorkoutScheduleKind, WorkoutSessionSlot } from '@/modules/coaching/coaching-ports';

export function mealSlotLabel(mealSlot: MealSlot): string {
    return nutritionMealSlotLabel(mealSlot);
}

const SESSION_SLOT_LABELS: Record<WorkoutSessionSlot, string> = {
    MORNING: 'Morning',
    EVENING: 'Evening',
};

export function workoutSessionSlotLabel(slot: WorkoutSessionSlot): string {
    return SESSION_SLOT_LABELS[slot];
}

const SCHEDULE_KIND_LABELS: Record<WorkoutScheduleKind, string> = {
    REST: 'Rest day',
    TRAINING: 'Training',
};

export function workoutScheduleKindLabel(kind: WorkoutScheduleKind): string {
    return SCHEDULE_KIND_LABELS[kind];
}

export function formatSetsReps(sets: number, reps: string): string {
    return `${sets} × ${reps}`;
}

export function formatStreakDays(count: number): string {
    return count === 1 ? '1 day' : `${count} days`;
}

export function formatAdherencePercent(value: number | null): string | null {
    if (value === null) {
        return null;
    }
    return `${value}%`;
}
