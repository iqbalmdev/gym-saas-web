import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

import { WorkQueueSkeleton } from '@/components/admin/work-queue-skeleton';
import { getSession, isStaffSession } from '@/lib/auth/session';
import { getQueryClient } from '@/lib/query/query-client';
import { listStaffGymOrgs } from '@/modules/gym-orgs/list-staff-gym-orgs';
import { DietTemplatesAdminPanel } from '@/modules/coaching/components/diet-templates-admin-panel';
import { coachingKeys } from '@/modules/coaching/coaching-query-keys';
import { listDietPlanTemplatesForGym } from '@/modules/coaching/coaching-queries';

async function DietTemplatesCatalog({ accessToken }: { accessToken: string }) {
    const gymOrgs = await listStaffGymOrgs(accessToken);
    const gym = gymOrgs[0];
    if (!gym) {
        return null;
    }

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: coachingKeys.dietTemplates(),
        queryFn: () => listDietPlanTemplatesForGym({ accessToken, gymOrgId: gym.id }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DietTemplatesAdminPanel gymName={gym.name} />
        </HydrationBoundary>
    );
}

export default async function DietTemplatesPage() {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg) md:text-3xl">Diet templates</h1>
                <p className="mt-2 max-w-2xl text-sm text-(--color-fg-muted)">
                    Reusable meal plans for assigning to members. Changes here do not alter plans already assigned.
                </p>
            </div>

            <Suspense fallback={<WorkQueueSkeleton />}>
                <DietTemplatesCatalog accessToken={session.accessToken} />
            </Suspense>
        </div>
    );
}
