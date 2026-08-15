/** Named Gym Backend paths for auth — adapters only. */
export const endpoints = {
    otpRequest: '/auth/otp/request',
    otpVerify: '/auth/otp/verify',
    googleStart: '/auth/google/start',
    googleComplete: '/auth/google/complete',
    me: '/auth/me',
    refresh: '/auth/refresh',
} as const;
