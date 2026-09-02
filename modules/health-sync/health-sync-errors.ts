/** Calm copy for Health Sync API errors. A missing WEARABLES grant is not an error in the UI. */
const HEALTH_SYNC_ERROR_COPY: Record<string, string> = {
    AUTHENTICATION_FAILED: 'Your session expired. Sign in again.',
    FORBIDDEN: 'You cannot view this member data.',
    HEALTH_SYNC_FORBIDDEN: 'This member has not shared wearable metrics.',
    NOT_FOUND: 'That health app is not connected yet.',
    UNIQUE_VIOLATION: 'That health app is already connected.',
    VALIDATION_ERROR: 'Check the health app details and try again.',
    NETWORK_OR_UNKNOWN: 'Could not reach the server. Check your connection.',
};

export function healthSyncErrorMessage(code: string, fallbackMessage?: string): string {
    return HEALTH_SYNC_ERROR_COPY[code] ?? fallbackMessage ?? 'Something went wrong. Please try again.';
}

/** Postman: the staff metrics read answers 403 `HEALTH_SYNC_FORBIDDEN` without a WEARABLES grant. */
export function isWearablesGrantMissing(code: string): boolean {
    return code === 'HEALTH_SYNC_FORBIDDEN';
}
