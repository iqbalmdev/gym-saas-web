/** Named Gym Backend paths for staff invites — adapters only. */
export const endpoints = {
    gymOrgStaffInvites: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/staff-invites`,
    staffInviteInbox: '/gym-orgs/staff-invites/inbox',
    staffInviteRevoke: (inviteId: string) => `/gym-orgs/staff-invites/${encodeURIComponent(inviteId)}/revoke`,
    staffInviteAccept: (inviteId: string) => `/gym-orgs/staff-invites/${encodeURIComponent(inviteId)}/accept`,
} as const;
