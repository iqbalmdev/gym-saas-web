/** Named Gym Backend path constants — adapters only. */
export const endpoints = {
  health: "/health",
  otpRequest: "/auth/otp/request",
  otpVerify: "/auth/otp/verify",
  googleStart: "/auth/google/start",
  googleComplete: "/auth/google/complete",
  me: "/auth/me",
  gymOrgs: "/gym-orgs",
  gymOrgStaffInvites: (gymOrgId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/staff-invites`,
  staffInviteInbox: "/gym-orgs/staff-invites/inbox",
  staffInviteRevoke: (inviteId: string) =>
    `/gym-orgs/staff-invites/${encodeURIComponent(inviteId)}/revoke`,
  staffInviteAccept: (inviteId: string) =>
    `/gym-orgs/staff-invites/${encodeURIComponent(inviteId)}/accept`,
} as const;
