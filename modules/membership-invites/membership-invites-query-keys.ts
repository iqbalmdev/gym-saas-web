/** Query-key factory for the members page (ADR-0011). */
export const membershipInvitesKeys = {
    all: ['membership-invites'] as const,
    list: () => [...membershipInvitesKeys.all, 'list'] as const,
};

/** CLIENT member home — invite inbox + per-gym data-sharing panels in one payload. */
export const clientHomeKeys = {
    all: ['client-home'] as const,
    page: () => [...clientHomeKeys.all, 'page'] as const,
};
