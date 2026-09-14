import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

import { getSession, isClientSession } from '@/lib/auth/session';
import { getQueryClient } from '@/lib/query/query-client';
import { ClientCalorieLogPanel } from '@/modules/nutrition/components/client-calorie-log-panel';
import { FoodCatalogPanel } from '@/modules/nutrition/components/food-catalog-panel';
import { toFoodNameMap } from '@/modules/nutrition/nutrition-food-names';
import { nutritionKeys } from '@/modules/nutrition/nutrition-query-keys';
import { getMyCalorieLogForSession, searchFoodsForSession } from '@/modules/nutrition/nutrition-queries';

async function ClientNutritionWorkspace({ accessToken }: { accessToken: string }) {
    const queryClient = getQueryClient();

    // The unfiltered catalog doubles as the id → name lookup for diary lines.
    const [calorieLog, foods] = await Promise.all([
        getMyCalorieLogForSession({ accessToken }),
        searchFoodsForSession({ accessToken, query: '' }),
    ]);

    queryClient.setQueryData(nutritionKeys.myLog(), calorieLog);
    queryClient.setQueryData(nutritionKeys.foods(''), foods);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="space-y-6">
                <ClientCalorieLogPanel foodNames={toFoodNameMap(foods)} initial={calorieLog} />
                <FoodCatalogPanel initial={foods} />
            </div>
        </HydrationBoundary>
    );
}

export default async function ClientNutritionPage() {
    const session = await getSession();
    if (!session || !isClientSession(session)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg)">Nutrition</h1>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Your daily food diary and the Indian food catalog. Meals stay yours — gyms read them only with your
                    Calories consent.
                </p>
            </div>

            <Suspense fallback={<ClientNutritionSkeleton />}>
                <ClientNutritionWorkspace accessToken={session.accessToken} />
            </Suspense>
        </div>
    );
}

function ClientNutritionSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            {[0, 1].map((panel) => (
                <div
                    key={panel}
                    className="animate-pulse space-y-3 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
                >
                    <div className="h-5 w-32 rounded bg-(--color-border)" />
                    <div className="h-4 w-full max-w-md rounded bg-(--color-border)" />
                    <div className="h-9 w-28 rounded-md bg-(--color-border)" />
                </div>
            ))}
        </div>
    );
}
