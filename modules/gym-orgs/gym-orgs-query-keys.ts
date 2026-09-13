/** Query-key factory for gym-org reads used on Admin surfaces (ADR-0011). */
export const gymOrgsKeys = {
    all: ['gym-orgs'] as const,
    myGym: () => [...gymOrgsKeys.all, 'me', 'gym'] as const,
    trainers: () => [...gymOrgsKeys.all, 'trainers'] as const,
};
