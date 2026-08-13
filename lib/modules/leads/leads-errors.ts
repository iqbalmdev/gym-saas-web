/** Calm copy for CRM lead API errors. */
const LEAD_ERROR_COPY: Record<string, string> = {
    AUTHENTICATION_FAILED: 'Your session expired. Sign in again.',
    FORBIDDEN: 'You need Admin access at this gym to manage leads.',
    NOT_FOUND: 'That lead was not found.',
    VALIDATION_ERROR: 'Check the lead details and try again.',
    NETWORK_OR_UNKNOWN: 'Could not reach the server. Check your connection.',
};

export function leadErrorMessage(code: string, fallbackMessage?: string): string {
    return LEAD_ERROR_COPY[code] ?? fallbackMessage ?? 'Something went wrong. Please try again.';
}

export function leadWarningMessage(code: string, fallback?: string): string {
    if (code === 'DUPLICATE_OPEN_LEAD_PHONE') {
        return 'Another open lead already uses this phone number.';
    }
    return fallback ?? 'Saved with a warning.';
}
