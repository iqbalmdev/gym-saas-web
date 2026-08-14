import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled, createE2ePlansAdapter } from '@/lib/api/e2e-fixtures';
import { createPlansAdapter } from '@/modules/plans/plans-adapter';
import {
    createCreatePlan,
    createListPlans,
    createSoftDeletePlan,
    createUpdatePlan,
} from '@/modules/plans/plans-use-cases';

/** Binds the plans port to its adapter and use-cases (ADR-0007). */
export function plansServices(http: HttpClient) {
    const plans = areE2eFixturesEnabled() ? createE2ePlansAdapter() : createPlansAdapter(http);
    return {
        plans,
        listPlans: createListPlans({ plans }),
        createPlan: createCreatePlan({ plans }),
        updatePlan: createUpdatePlan({ plans }),
        softDeletePlan: createSoftDeletePlan({ plans }),
    };
}
