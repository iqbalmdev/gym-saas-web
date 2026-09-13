import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

import { getSession, isClientSession } from '@/lib/auth/session';
import { getQueryClient } from '@/lib/query/query-client';
import { ClientWorkoutSchedulePanel } from '@/modules/coaching/components/client-workout-schedule-panel';
import { coachingKeys } from '@/modules/coaching/coaching-query-keys';
import { getMyWorkoutScheduleForSession, getMyWorkoutStreakForSession } from '@/modules/coaching/coaching-queries';
import { isoWeekRangeLocal } from '@/modules/coaching/coaching-week-range';
import { getMyGymForSession } from '@/modules/gym-orgs/gym-orgs-queries';

async function ClientWorkoutsWorkspace({ accessToken, gymOrgId }: { accessToken: string; gymOrgId: string }) {
    const queryClient = getQueryClient();
    const { from, to } = isoWeekRangeLocal();

    const [schedule, streak] = await Promise.all([
        getMyWorkoutScheduleForSession({ accessToken, gymOrgId, from, to }),
        getMyWorkoutStreakForSession({ accessToken, gymOrgId }),
    ]);

    queryClient.setQueryData(coachingKeys.myWorkoutSchedule(from, to), schedule);
    queryClient.setQueryData(coachingKeys.myWorkoutStreak(), streak);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ClientWorkoutSchedulePanel weekFrom={from} weekTo={to} initialSchedule={schedule} initialStreak={streak} />
        </HydrationBoundary>
    );
}

export default async function ClientWorkoutsPage() {
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
                <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg)">Workouts</h1>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Your weekly training schedule and streak. Tick exercises as you finish them at the gym.
                </p>
            </div>

            {gymOrgId ? (
                <Suspense fallback={<ClientWorkoutsSkeleton />}>
                    <ClientWorkoutsWorkspace accessToken={session.accessToken} gymOrgId={gymOrgId} />
                </Suspense>
            ) : (
                <p className="text-sm text-(--color-fg-muted)">
                    You need an active gym membership before workouts can appear here.
                </p>
            )}
        </div>
    );
}

function ClientWorkoutsSkeleton() {
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
