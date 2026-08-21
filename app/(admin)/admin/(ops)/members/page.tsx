import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

import { getSession, isStaffSession } from '@/lib/auth/session';
import { getQueryClient } from '@/lib/query/query-client';
import { gymOrgsKeys } from '@/modules/gym-orgs/gym-orgs-query-keys';
import { listGymTrainersForGym } from '@/modules/gym-orgs/gym-orgs-queries';
import { listStaffGymOrgs } from '@/modules/gym-orgs/list-staff-gym-orgs';
import { MembersAdminPanel } from '@/modules/membership-invites/components/members-admin-panel';
import { MembersPageSkeleton } from '@/modules/membership-invites/components/members-page-skeleton';
import { membershipInvitesKeys } from '@/modules/membership-invites/membership-invites-query-keys';
import { listMembershipInvitesPageForGym } from '@/modules/membership-invites/membership-invites-queries';
import { RosterPanel } from '@/modules/roster/components/roster-panel';
import { rosterKeys } from '@/modules/roster/roster-query-keys';
import { listActiveRosterForGym } from '@/modules/roster/roster-queries';

/**
 * Invites, roster, and gym trainers are prefetched in parallel but kept as
 * **separate query keys**: a check-in block should not refetch invites or the
 * trainer picker (and vice versa).
 */
async function MembersWorkspace({ accessToken }: { accessToken: string }) {
    const gymOrgs = await listStaffGymOrgs(accessToken);
    const gym = gymOrgs[0];
    if (!gym) {
        // Unreachable in practice: (ops)/layout.tsx redirects 0-gym Staff to Settings.
        return null;
    }

    const queryClient = getQueryClient();
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: membershipInvitesKeys.list(),
            queryFn: () => listMembershipInvitesPageForGym({ accessToken, gymOrgId: gym.id }),
        }),
        queryClient.prefetchQuery({
            queryKey: rosterKeys.active(),
            queryFn: () => listActiveRosterForGym({ accessToken, gymOrgId: gym.id }),
        }),
        queryClient.prefetchQuery({
            queryKey: gymOrgsKeys.trainers(),
            queryFn: () => listGymTrainersForGym({ accessToken, gymOrgId: gym.id }),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="space-y-8">
                <MembersAdminPanel />
                <RosterPanel />
            </div>
        </HydrationBoundary>
    );
}

export default async function MembersPage() {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg) md:text-3xl">Members</h1>
                <p className="mt-2 max-w-2xl text-sm text-(--color-fg-muted)">
                    Invite clients by email with a Base plan (optional Trainer add-on). Payment badges are informational
                    — entitlement follows subscription dates after accept.
                </p>
            </div>

            <Suspense fallback={<MembersPageSkeleton />}>
                <MembersWorkspace accessToken={session.accessToken} />
            </Suspense>
        </div>
    );
}
