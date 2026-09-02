/** Calm copy for Nutrition API errors. A missing CALORIES grant is not an error in the UI. */
const NUTRITION_ERROR_COPY: Record<string, string> = {
    AUTHENTICATION_FAILED: 'Your session expired. Sign in again.',
    FORBIDDEN: 'You cannot view this member data.',
    NUTRITION_FORBIDDEN: 'This member has not shared their food diary.',
    NOT_FOUND: 'That food is no longer in the catalog.',
    INVALID_NUTRITION: 'Prescribed foods are removed from the diet plan, not the diary.',
    VALIDATION_ERROR: 'Check the entry and try again.',
    NETWORK_OR_UNKNOWN: 'Could not reach the server. Check your connection.',
};

export function nutritionErrorMessage(code: string, fallbackMessage?: string): string {
    return NUTRITION_ERROR_COPY[code] ?? fallbackMessage ?? 'Something went wrong. Please try again.';
}

/** Postman: the staff diary read answers 403 `NUTRITION_FORBIDDEN` without a CALORIES grant. */
export function isCaloriesGrantMissing(code: string): boolean {
    return code === 'NUTRITION_FORBIDDEN';
}
