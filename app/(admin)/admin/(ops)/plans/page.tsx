import { PlansAdminPanel } from '@/lib/modules/plans/components/plans-admin-panel';
import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { getSession, isStaffSession } from '@/lib/auth/session';
import { planErrorMessage } from '@/lib/modules/plans/plans-errors';
import { listStaffGymOrgs } from '@/lib/modules/gym-orgs/list-staff-gym-orgs';
import type { MembershipPlan, PlanKind } from '@/lib/modules/plans/plans-ports';

type PlansPageProps = {
    searchParams: Promise<{ kind?: string }>;
};

function parseKind(raw: string | undefined): PlanKind | 'ALL' {
    if (raw === 'BASE' || raw === 'ADDON') {
        return raw;
    }
    return 'ALL';
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        return null;
    }

    const params = await searchParams;
    const kindFilter = parseKind(params.kind);
    const gymOrgs = await listStaffGymOrgs(session.accessToken);
    const gym = gymOrgs[0];
    if (!gym) {
        return null;
    }

    let plans: MembershipPlan[] = [];
    let listError: string | null = null;
    try {
        const { listPlans } = createAppServices();
        const { plans: page } = await listPlans({
            accessToken: session.accessToken,
            gymOrgId: gym.id,
            kind: kindFilter === 'ALL' ? undefined : kindFilter,
        });
        plans = page.items;
    } catch (error) {
        listError =
            error instanceof ApiClientError
                ? planErrorMessage(error.code, error.message)
                : planErrorMessage('NETWORK_OR_UNKNOWN');
    }

    return <PlansAdminPanel gymName={gym.name} plans={plans} kindFilter={kindFilter} listError={listError} />;
}
