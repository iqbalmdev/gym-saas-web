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
  gymOrgMembershipInvites: (gymOrgId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/membership-invites`,
  gymOrgMembershipInviteRevoke: (gymOrgId: string, membershipInviteId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/membership-invites/${encodeURIComponent(membershipInviteId)}/revoke`,
  membershipInviteInbox: "/membership-invites/inbox",
  membershipInviteAccept: (membershipInviteId: string) =>
    `/membership-invites/${encodeURIComponent(membershipInviteId)}/accept`,
  gymOrgMyDataGrants: (gymOrgId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-data-grants`,
  gymOrgMembers: (gymOrgId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/members`,
  gymOrgMemberOffboard: (gymOrgId: string, membershipId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/members/${encodeURIComponent(membershipId)}/offboard`,
  gymOrgMemberCheckInBlock: (gymOrgId: string, membershipId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/members/${encodeURIComponent(membershipId)}/check-in-block`,
  gymOrgAttendances: (gymOrgId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/attendances`,
  gymOrgAttendanceDeskMark: (gymOrgId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/attendances/desk-mark`,
  gymOrgRenewalsDue: (gymOrgId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/subscriptions/renewals-due`,
  gymOrgSubscriptionPayment: (gymOrgId: string, subscriptionId: string) =>
    `/gym-orgs/${encodeURIComponent(gymOrgId)}/subscriptions/${encodeURIComponent(subscriptionId)}/payment`,
} as const;
