import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

import { getSession, isStaffSession } from '@/lib/auth/session';
import { getQueryClient } from '@/lib/query/query-client';
import { listStaffGymOrgs } from '@/modules/gym-orgs/list-staff-gym-orgs';
import { RenewalsAdminPanel } from '@/modules/subscriptions/components/renewals-admin-panel';
import { RenewalsAdminPanelSkeleton } from '@/modules/subscriptions/components/renewals-admin-panel-skeleton';
import { subscriptionsKeys } from '@/modules/subscriptions/subscriptions-query-keys';
import { listRenewalsDueForGym } from '@/modules/subscriptions/subscriptions-queries';

function isoDateOffset(days: number): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

/** Prefetches the renewals window server-side, then hands the warm cache to TanStack (ADR-0011). */
async function RenewalsInbox({
    accessToken,
    onOrAfter,
    onOrBefore,
}: {
    accessToken: string;
    onOrAfter: string;
    onOrBefore: string;
}) {
    const gymOrgs = await listStaffGymOrgs(accessToken);
    const gym = gymOrgs[0];
    if (!gym) {
        // Unreachable in practice: (ops)/layout.tsx redirects 0-gym Staff to Settings.
        return null;
    }

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: subscriptionsKeys.renewalsDue(onOrAfter, onOrBefore),
        queryFn: () => listRenewalsDueForGym({ accessToken, gymOrgId: gym.id, onOrAfter, onOrBefore }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RenewalsAdminPanel onOrAfter={onOrAfter} onOrBefore={onOrBefore} />
        </HydrationBoundary>
    );
}

export default async function RenewalsPage() {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        return null;
    }

    const onOrAfter = isoDateOffset(0);
    const onOrBefore = isoDateOffset(2);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg) md:text-3xl">Renewals</h1>
                <p className="mt-2 max-w-2xl text-sm text-(--color-fg-muted)">
                    Subscriptions ending {onOrAfter} → {onOrBefore}. Payment badges nudge — they do not auto lock
                    check-in.
                </p>
            </div>

            <Suspense fallback={<RenewalsAdminPanelSkeleton />}>
                <RenewalsInbox accessToken={session.accessToken} onOrAfter={onOrAfter} onOrBefore={onOrBefore} />
            </Suspense>
        </div>
    );
}
