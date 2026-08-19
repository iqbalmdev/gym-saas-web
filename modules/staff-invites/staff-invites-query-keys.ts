/** Query-key factory for the gym's staff-invite list (ADR-0011). */
export const staffInvitesKeys = {
    all: ['staff-invites'] as const,
    gymList: () => [...staffInvitesKeys.all, 'gym-list'] as const,
};
