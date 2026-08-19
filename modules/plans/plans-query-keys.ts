import type { PlanKind } from '@/modules/plans/plans-ports';

/**
 * Query-key factory for the plan catalog (ADR-0011).
 *
 * Deliberately dependency-free so both the server prefetch and the client
 * hooks import the *same* keys — a key that is spelled out by hand on one side
 * silently breaks hydration, which shows up as a redundant refetch rather than
 * an error.
 *
 * Hierarchical on purpose: `invalidateQueries({ queryKey: plansKeys.all })`
 * matches every filtered list, so a mutation does not need to know which
 * filter the user is currently on.
 */
export const plansKeys = {
    all: ['plans'] as const,
    list: (kindFilter: PlanKind | 'ALL') => [...plansKeys.all, 'list', kindFilter] as const,
};
