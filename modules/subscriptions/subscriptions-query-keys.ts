/** Query-key factory for the renewals inbox (ADR-0011). */
export const subscriptionsKeys = {
    all: ['subscriptions'] as const,
    renewalsDue: (onOrAfter: string, onOrBefore: string) =>
        [...subscriptionsKeys.all, 'renewals-due', onOrAfter, onOrBefore] as const,
};
