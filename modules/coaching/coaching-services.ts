import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled } from '@/lib/api/e2e/store';
import { createCoachingAdapter } from '@/modules/coaching/coaching-adapter';
import { createE2eCoachingAdapter } from '@/modules/coaching/coaching-e2e-fixtures';
import {
    createCompleteDietItem,
    createCompleteScheduleExercise,
    createGetMyDietPlan,
    createGetMyWorkoutSchedule,
    createGetMyWorkoutStreak,
    createUncompleteDietItem,
    createUncompleteScheduleExercise,
} from '@/modules/coaching/coaching-use-cases';

/** Binds the coaching port to its adapter and use-cases (ADR-0007). */
export function coachingServices(http: HttpClient) {
    const coaching = areE2eFixturesEnabled() ? createE2eCoachingAdapter() : createCoachingAdapter(http);
    return {
        coaching,
        getMyDietPlan: createGetMyDietPlan({ coaching }),
        getMyWorkoutSchedule: createGetMyWorkoutSchedule({ coaching }),
        getMyWorkoutStreak: createGetMyWorkoutStreak({ coaching }),
        completeDietItem: createCompleteDietItem({ coaching }),
        uncompleteDietItem: createUncompleteDietItem({ coaching }),
        completeScheduleExercise: createCompleteScheduleExercise({ coaching }),
        uncompleteScheduleExercise: createUncompleteScheduleExercise({ coaching }),
    };
}
