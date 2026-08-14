/** Named Gym Backend paths for membership invites + client data grants. */
export const endpoints = {
    gymOrgMembershipInvites: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/membership-invites`,
    gymOrgMembershipInviteRevoke: (gymOrgId: string, membershipInviteId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/membership-invites/${encodeURIComponent(membershipInviteId)}/revoke`,
    membershipInviteInbox: '/membership-invites/inbox',
    membershipInviteAccept: (membershipInviteId: string) =>
        `/membership-invites/${encodeURIComponent(membershipInviteId)}/accept`,
    gymOrgMyDataGrants: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/my-data-grants`,
} as const;
