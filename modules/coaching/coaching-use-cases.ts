import type { CoachingReader, CoachingWriter } from '@/modules/coaching/coaching-ports';

export function createGetMyDietPlan(deps: { coaching: CoachingReader }) {
    return async function getMyDietPlan(input: Parameters<CoachingReader['getMyDietPlan']>[0]) {
        return deps.coaching.getMyDietPlan(input);
    };
}

export function createGetMyWorkoutSchedule(deps: { coaching: CoachingReader }) {
    return async function getMyWorkoutSchedule(input: Parameters<CoachingReader['getMyWorkoutSchedule']>[0]) {
        return deps.coaching.getMyWorkoutSchedule(input);
    };
}

export function createGetMyWorkoutStreak(deps: { coaching: CoachingReader }) {
    return async function getMyWorkoutStreak(input: Parameters<CoachingReader['getMyWorkoutStreak']>[0]) {
        return deps.coaching.getMyWorkoutStreak(input);
    };
}

export function createCompleteDietItem(deps: { coaching: CoachingWriter }) {
    return async function completeDietItem(input: Parameters<CoachingWriter['completeDietItem']>[0]) {
        return deps.coaching.completeDietItem(input);
    };
}

export function createUncompleteDietItem(deps: { coaching: CoachingWriter }) {
    return async function uncompleteDietItem(input: Parameters<CoachingWriter['uncompleteDietItem']>[0]) {
        return deps.coaching.uncompleteDietItem(input);
    };
}

export function createCompleteScheduleExercise(deps: { coaching: CoachingWriter }) {
    return async function completeScheduleExercise(input: Parameters<CoachingWriter['completeScheduleExercise']>[0]) {
        return deps.coaching.completeScheduleExercise(input);
    };
}

export function createUncompleteScheduleExercise(deps: { coaching: CoachingWriter }) {
    return async function uncompleteScheduleExercise(
        input: Parameters<CoachingWriter['uncompleteScheduleExercise']>[0],
    ) {
        return deps.coaching.uncompleteScheduleExercise(input);
    };
}

export function createSearchExercises(deps: { coaching: CoachingReader }) {
    return async function searchExercises(input: Parameters<CoachingReader['searchExercises']>[0]) {
        return deps.coaching.searchExercises(input);
    };
}

export function createListDietPlanTemplates(deps: { coaching: CoachingReader }) {
    return async function listDietPlanTemplates(input: Parameters<CoachingReader['listDietPlanTemplates']>[0]) {
        return deps.coaching.listDietPlanTemplates(input);
    };
}

export function createGetDietPlanTemplate(deps: { coaching: CoachingReader }) {
    return async function getDietPlanTemplate(input: Parameters<CoachingReader['getDietPlanTemplate']>[0]) {
        return deps.coaching.getDietPlanTemplate(input);
    };
}

export function createListWorkoutPlanTemplates(deps: { coaching: CoachingReader }) {
    return async function listWorkoutPlanTemplates(input: Parameters<CoachingReader['listWorkoutPlanTemplates']>[0]) {
        return deps.coaching.listWorkoutPlanTemplates(input);
    };
}

export function createGetWorkoutPlanTemplate(deps: { coaching: CoachingReader }) {
    return async function getWorkoutPlanTemplate(input: Parameters<CoachingReader['getWorkoutPlanTemplate']>[0]) {
        return deps.coaching.getWorkoutPlanTemplate(input);
    };
}

export function createGetClientDietPlan(deps: { coaching: CoachingReader }) {
    return async function getClientDietPlan(input: Parameters<CoachingReader['getClientDietPlan']>[0]) {
        return deps.coaching.getClientDietPlan(input);
    };
}

export function createGetClientWorkoutSchedule(deps: { coaching: CoachingReader }) {
    return async function getClientWorkoutSchedule(input: Parameters<CoachingReader['getClientWorkoutSchedule']>[0]) {
        return deps.coaching.getClientWorkoutSchedule(input);
    };
}

export function createGetClientWorkoutStreak(deps: { coaching: CoachingReader }) {
    return async function getClientWorkoutStreak(input: Parameters<CoachingReader['getClientWorkoutStreak']>[0]) {
        return deps.coaching.getClientWorkoutStreak(input);
    };
}

export function createCreateDietPlanTemplate(deps: { coaching: CoachingWriter }) {
    return async function createDietPlanTemplate(input: Parameters<CoachingWriter['createDietPlanTemplate']>[0]) {
        return deps.coaching.createDietPlanTemplate(input);
    };
}

export function createUpdateDietPlanTemplate(deps: { coaching: CoachingWriter }) {
    return async function updateDietPlanTemplate(input: Parameters<CoachingWriter['updateDietPlanTemplate']>[0]) {
        return deps.coaching.updateDietPlanTemplate(input);
    };
}

export function createDeleteDietPlanTemplate(deps: { coaching: CoachingWriter }) {
    return async function deleteDietPlanTemplate(input: Parameters<CoachingWriter['deleteDietPlanTemplate']>[0]) {
        return deps.coaching.deleteDietPlanTemplate(input);
    };
}

export function createDuplicateDietPlanTemplate(deps: { coaching: CoachingWriter }) {
    return async function duplicateDietPlanTemplate(input: Parameters<CoachingWriter['duplicateDietPlanTemplate']>[0]) {
        return deps.coaching.duplicateDietPlanTemplate(input);
    };
}

export function createCreateWorkoutPlanTemplate(deps: { coaching: CoachingWriter }) {
    return async function createWorkoutPlanTemplate(input: Parameters<CoachingWriter['createWorkoutPlanTemplate']>[0]) {
        return deps.coaching.createWorkoutPlanTemplate(input);
    };
}

export function createUpdateWorkoutPlanTemplate(deps: { coaching: CoachingWriter }) {
    return async function updateWorkoutPlanTemplate(input: Parameters<CoachingWriter['updateWorkoutPlanTemplate']>[0]) {
        return deps.coaching.updateWorkoutPlanTemplate(input);
    };
}

export function createDeleteWorkoutPlanTemplate(deps: { coaching: CoachingWriter }) {
    return async function deleteWorkoutPlanTemplate(input: Parameters<CoachingWriter['deleteWorkoutPlanTemplate']>[0]) {
        return deps.coaching.deleteWorkoutPlanTemplate(input);
    };
}

export function createDuplicateWorkoutPlanTemplate(deps: { coaching: CoachingWriter }) {
    return async function duplicateWorkoutPlanTemplate(
        input: Parameters<CoachingWriter['duplicateWorkoutPlanTemplate']>[0],
    ) {
        return deps.coaching.duplicateWorkoutPlanTemplate(input);
    };
}

export function createAssignClientDietPlanFromTemplate(deps: { coaching: CoachingWriter }) {
    return async function assignClientDietPlanFromTemplate(
        input: Parameters<CoachingWriter['assignClientDietPlanFromTemplate']>[0],
    ) {
        return deps.coaching.assignClientDietPlanFromTemplate(input);
    };
}

export function createUpsertClientWorkoutSchedule(deps: { coaching: CoachingWriter }) {
    return async function upsertClientWorkoutSchedule(
        input: Parameters<CoachingWriter['upsertClientWorkoutSchedule']>[0],
    ) {
        return deps.coaching.upsertClientWorkoutSchedule(input);
    };
}
