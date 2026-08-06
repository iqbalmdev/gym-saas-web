/** Named Gym Backend path constants — adapters only. */
export const endpoints = {
  health: "/health",
  otpRequest: "/auth/otp/request",
  otpVerify: "/auth/otp/verify",
  me: "/auth/me",
  gymOrgs: "/gym-orgs",
} as const;
