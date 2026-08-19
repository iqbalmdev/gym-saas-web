/** Query-key factory for the active roster (ADR-0011). */
export const rosterKeys = {
    all: ['roster'] as const,
    active: () => [...rosterKeys.all, 'active'] as const,
};
