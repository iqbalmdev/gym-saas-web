/** Calm copy for Coaching API errors. */
const COACHING_ERROR_COPY: Record<string, string> = {
    AUTHENTICATION_FAILED: 'Your session expired. Sign in again.',
    COACHING_FORBIDDEN: 'Your gym has not assigned a coaching plan yet.',
    COACHING_ADDON_REQUIRED: 'Your coaching add-on has expired. Contact your gym to renew.',
    ALREADY_LOGGED_PRESCRIBED: 'This meal is already marked eaten for today.',
    ALREADY_COMPLETED_WORKOUT_EXERCISE: 'This exercise is already marked complete.',
    INVALID_WORKOUT_SCHEDULE: 'This exercise can no longer be changed for that day.',
    NOT_FOUND: 'That item is no longer on your plan.',
    VALIDATION_ERROR: 'Check the details and try again.',
    NETWORK_OR_UNKNOWN: 'Could not reach the server. Check your connection.',
};

export function coachingErrorMessage(code: string, fallbackMessage?: string): string {
    return COACHING_ERROR_COPY[code] ?? fallbackMessage ?? 'Something went wrong. Please try again.';
}
