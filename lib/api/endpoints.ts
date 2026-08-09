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
  gymOrgPlans: (gymOrgId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/plans`,
  gymOrgPlan: (gymOrgId: string, planId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/plans/${encodeURIComponent(planId)}`,
  gymOrgLeads: (gymOrgId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/leads`,
  gymOrgLead: (gymOrgId: string, leadId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/leads/${encodeURIComponent(leadId)}`,
  gymOrgLeadStatus: (gymOrgId: string, leadId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/leads/${encodeURIComponent(leadId)}/status`,
  gymOrgLeadDueFollowUps: (gymOrgId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/leads/due-follow-ups`,
} as const;
