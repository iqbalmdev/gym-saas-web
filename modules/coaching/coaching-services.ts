import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled } from '@/lib/api/e2e/store';
import { createCoachingAdapter } from '@/modules/coaching/coaching-adapter';
import { createE2eCoachingAdapter } from '@/modules/coaching/coaching-e2e-fixtures';
import {
    createAssignClientDietPlanFromTemplate,
    createCompleteDietItem,
    createCompleteScheduleExercise,
    createCreateDietPlanTemplate,
    createCreateWorkoutPlanTemplate,
    createDeleteDietPlanTemplate,
    createDeleteWorkoutPlanTemplate,
    createDuplicateDietPlanTemplate,
    createDuplicateWorkoutPlanTemplate,
    createGetClientDietPlan,
    createGetClientWorkoutSchedule,
    createGetClientWorkoutStreak,
    createGetDietPlanTemplate,
    createGetMyDietPlan,
    createGetMyWorkoutSchedule,
    createGetMyWorkoutStreak,
    createGetWorkoutPlanTemplate,
    createListDietPlanTemplates,
    createListWorkoutPlanTemplates,
    createSearchExercises,
    createUncompleteDietItem,
    createUncompleteScheduleExercise,
    createUpdateDietPlanTemplate,
    createUpdateWorkoutPlanTemplate,
    createUpsertClientWorkoutSchedule,
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
        searchExercises: createSearchExercises({ coaching }),
        listDietPlanTemplates: createListDietPlanTemplates({ coaching }),
        getDietPlanTemplate: createGetDietPlanTemplate({ coaching }),
        listWorkoutPlanTemplates: createListWorkoutPlanTemplates({ coaching }),
        getWorkoutPlanTemplate: createGetWorkoutPlanTemplate({ coaching }),
        getClientDietPlan: createGetClientDietPlan({ coaching }),
        getClientWorkoutSchedule: createGetClientWorkoutSchedule({ coaching }),
        getClientWorkoutStreak: createGetClientWorkoutStreak({ coaching }),
        createDietPlanTemplate: createCreateDietPlanTemplate({ coaching }),
        updateDietPlanTemplate: createUpdateDietPlanTemplate({ coaching }),
        deleteDietPlanTemplate: createDeleteDietPlanTemplate({ coaching }),
        duplicateDietPlanTemplate: createDuplicateDietPlanTemplate({ coaching }),
        createWorkoutPlanTemplate: createCreateWorkoutPlanTemplate({ coaching }),
        updateWorkoutPlanTemplate: createUpdateWorkoutPlanTemplate({ coaching }),
        deleteWorkoutPlanTemplate: createDeleteWorkoutPlanTemplate({ coaching }),
        duplicateWorkoutPlanTemplate: createDuplicateWorkoutPlanTemplate({ coaching }),
        assignClientDietPlanFromTemplate: createAssignClientDietPlanFromTemplate({ coaching }),
        upsertClientWorkoutSchedule: createUpsertClientWorkoutSchedule({ coaching }),
    };
}
