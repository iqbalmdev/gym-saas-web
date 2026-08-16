import { createAppServices } from '@/lib/api/composition';
import type { MembershipPlan, PlanKind } from '@/modules/plans/plans-ports';

/**
 * Server-side read for the plan catalog (ADR-0011).
 *
 * Consumed twice, deliberately: the RSC prefetch in `plans/page.tsx` calls it
 * directly, and `app/api/plans/route.ts` wraps it for client refetches. Having
 * one function behind both entry points is what stops the server-rendered
 * payload and the client refetch from drifting apart — the usual failure mode
 * of this pattern is writing the same read twice.
 *
 * Takes an explicit `gymOrgId` resolved from the session by the caller's gate;
 * it never reads a tenant id from request input.
 */
export async function listPlansForGym(input: {
    accessToken: string;
    gymOrgId: string;
    kindFilter: PlanKind | 'ALL';
}): Promise<MembershipPlan[]> {
    const { listPlans } = createAppServices();
    const { plans } = await listPlans({
        accessToken: input.accessToken,
        gymOrgId: input.gymOrgId,
        kind: input.kindFilter === 'ALL' ? undefined : input.kindFilter,
    });
    return plans.items;
}
