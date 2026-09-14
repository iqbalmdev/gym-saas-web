import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

import { getSession, isClientSession } from '@/lib/auth/session';
import { getQueryClient } from '@/lib/query/query-client';
import { ClientDietPlanPanel } from '@/modules/coaching/components/client-diet-plan-panel';
import { coachingKeys } from '@/modules/coaching/coaching-query-keys';
import { getMyDietPlanForSession } from '@/modules/coaching/coaching-queries';
import { getMyGymForSession } from '@/modules/gym-orgs/gym-orgs-queries';
import { toFoodNameMap } from '@/modules/nutrition/nutrition-food-names';
import { nutritionKeys } from '@/modules/nutrition/nutrition-query-keys';
import { searchFoodsForSession } from '@/modules/nutrition/nutrition-queries';

async function ClientDietWorkspace({ accessToken, gymOrgId }: { accessToken: string; gymOrgId: string }) {
    const queryClient = getQueryClient();

    const [dietPlan, foods] = await Promise.all([
        getMyDietPlanForSession({ accessToken, gymOrgId }),
        searchFoodsForSession({ accessToken, query: '' }),
    ]);

    queryClient.setQueryData(coachingKeys.myDietPlan(), dietPlan);
    queryClient.setQueryData(nutritionKeys.foods(''), foods);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ClientDietPlanPanel foodNames={toFoodNameMap(foods)} initial={dietPlan} />
        </HydrationBoundary>
    );
}

export default async function ClientDietPage() {
    const session = await getSession();
    if (!session || !isClientSession(session)) {
        return null;
    }

    let gymOrgId: string | null = null;
    try {
        const gymOrg = await getMyGymForSession({ accessToken: session.accessToken });
        gymOrgId = gymOrg.id;
    } catch {
        gymOrgId = null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg)">Diet</h1>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Your trainer-assigned meals for today. Completing an item logs it on your nutrition diary.
                </p>
            </div>

            {gymOrgId ? (
                <Suspense fallback={<ClientDietSkeleton />}>
                    <ClientDietWorkspace accessToken={session.accessToken} gymOrgId={gymOrgId} />
                </Suspense>
            ) : (
                <p className="text-sm text-(--color-fg-muted)">
                    You need an active gym membership before a diet plan can appear here.
                </p>
            )}
        </div>
    );
}

function ClientDietSkeleton() {
    return (
        <div
            className="animate-pulse space-y-3 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-hidden="true"
        >
            <div className="h-5 w-32 rounded bg-(--color-border)" />
            <div className="h-4 w-full max-w-md rounded bg-(--color-border)" />
            <div className="h-9 w-28 rounded-md bg-(--color-border)" />
        </div>
    );
}
