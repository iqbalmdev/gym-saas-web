/** Pure mapping of auth API error codes → calm user-facing copy. */
const AUTH_ERROR_COPY: Record<string, string> = {
    OTP_EXPIRED: 'That code is wrong or expired. Request a new one.',
    LANE_MISMATCH: 'This email belongs to a different account type.',
    LANE_REQUIRED: 'Choose whether you work at a gym or you are a member.',
    AUTH_RATE_LIMITED: 'Too many attempts. Wait about a minute and try again.',
    AUTHENTICATION_FAILED: 'Your session expired. Sign in again.',
    EMAIL_ADDRESS_INVALID: 'Enter a valid email address.',
    OTP_DELIVERY_FAILED: 'We could not send the email code. Try again shortly.',
    EMAIL_NOT_VERIFIED: 'Verify your email before continuing.',
    GOOGLE_IDENTITY_REQUIRED: 'That Google account is missing a verified email. Try another account or use email code.',
    OAUTH_CONFIGURATION: 'Google sign-in is not available right now. Use an email code instead.',
    NETWORK_OR_UNKNOWN: 'Could not reach the server. Check your connection.',
    VALIDATION_ERROR: 'Check the details you entered and try again.',
    GYM_ORG_CREATION_FORBIDDEN: 'You cannot create a gym with this account.',
};

export function authErrorMessage(code: string, fallbackMessage?: string): string {
    return AUTH_ERROR_COPY[code] ?? fallbackMessage ?? 'Something went wrong. Please try again.';
}
