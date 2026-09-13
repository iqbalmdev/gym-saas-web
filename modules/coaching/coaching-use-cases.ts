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
