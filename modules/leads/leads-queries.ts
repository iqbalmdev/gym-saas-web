import { createAppServices } from '@/lib/api/composition';
import type { Lead, LeadStatus } from '@/modules/leads/leads-ports';

export type LeadsPageData = {
    leads: Lead[];
    dueFollowUps: Lead[];
};

/**
 * Server-side read for the CRM pipeline (ADR-0011). Consumed by both the RSC
 * prefetch in `crm/page.tsx` and `app/api/leads/route.ts`, so the two can't
 * drift.
 */
export async function listLeadsPageForGym(input: {
    accessToken: string;
    gymOrgId: string;
    statusFilter: LeadStatus | 'ALL';
}): Promise<LeadsPageData> {
    const { listLeads, listDueFollowUps } = createAppServices();
    const [listResult, dueResult] = await Promise.all([
        listLeads({
            accessToken: input.accessToken,
            gymOrgId: input.gymOrgId,
            status: input.statusFilter === 'ALL' ? undefined : input.statusFilter,
        }),
        listDueFollowUps({ accessToken: input.accessToken, gymOrgId: input.gymOrgId }),
    ]);

    return {
        leads: listResult.leads.items,
        dueFollowUps: dueResult.leads.items,
    };
}
