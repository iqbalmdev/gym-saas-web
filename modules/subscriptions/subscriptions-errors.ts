/** Calm copy for subscription / renewals API errors. */
const SUBSCRIPTION_ERROR_COPY: Record<string, string> = {
    AUTHENTICATION_FAILED: 'Your session expired. Sign in again.',
    FORBIDDEN: 'You need Admin access at this gym to manage renewals.',
    PLAN_FORBIDDEN: 'You need Admin access at this gym to manage renewals.',
    NOT_FOUND: 'That subscription was not found.',
    VALIDATION_ERROR: 'Check the payment details and try again.',
    NETWORK_OR_UNKNOWN: 'Could not reach the server. Check your connection.',
};

export function subscriptionErrorMessage(code: string, fallbackMessage?: string): string {
    return SUBSCRIPTION_ERROR_COPY[code] ?? fallbackMessage ?? 'Something went wrong. Please try again.';
}
