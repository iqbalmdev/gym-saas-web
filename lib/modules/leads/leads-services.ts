import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled, createE2eLeadsAdapter } from '@/lib/api/e2e-fixtures';
import { createLeadsAdapter } from '@/lib/modules/leads/leads-adapter';
import {
    createChangeLeadStatus,
    createCreateLead,
    createListDueFollowUps,
    createListLeads,
    createSoftDeleteLead,
    createUpdateLead,
} from '@/lib/modules/leads/leads-use-cases';

/** Binds the leads port to its adapter and use-cases (ADR-0007). */
export function leadsServices(http: HttpClient) {
    const leads = areE2eFixturesEnabled() ? createE2eLeadsAdapter() : createLeadsAdapter(http);
    return {
        leads,
        listLeads: createListLeads({ leads }),
        listDueFollowUps: createListDueFollowUps({ leads }),
        createLead: createCreateLead({ leads }),
        updateLead: createUpdateLead({ leads }),
        changeLeadStatus: createChangeLeadStatus({ leads }),
        softDeleteLead: createSoftDeleteLead({ leads }),
    };
}
