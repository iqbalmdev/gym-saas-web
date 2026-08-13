import type {
    PlansReader,
    PlansWriter,
    CreatePlanInput,
    UpdatePlanInput,
    PlanKind,
} from '@/lib/modules/plans/plans-ports';

export function createListPlans(deps: { plans: PlansReader }) {
    return async function listPlans(input: {
        accessToken: string;
        gymOrgId: string;
        kind?: PlanKind;
        active?: boolean;
    }) {
        return deps.plans.list(input);
    };
}

export function createCreatePlan(deps: { plans: PlansWriter }) {
    return async function createPlan(input: { accessToken: string; gymOrgId: string; body: CreatePlanInput }) {
        return deps.plans.create(input);
    };
}

export function createUpdatePlan(deps: { plans: PlansWriter }) {
    return async function updatePlan(input: {
        accessToken: string;
        gymOrgId: string;
        planId: string;
        body: UpdatePlanInput;
    }) {
        return deps.plans.update(input);
    };
}

export function createSoftDeletePlan(deps: { plans: PlansWriter }) {
    return async function softDeletePlan(input: { accessToken: string; gymOrgId: string; planId: string }) {
        return deps.plans.softDelete(input);
    };
}
