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
import { AssignedMembersPanel } from '@/modules/roster/components/assigned-members-panel';
import { RosterPanel } from '@/modules/roster/components/roster-panel';
import { rosterKeys } from '@/modules/roster/roster-query-keys';
import { listActiveRosterForGym, listMyAssignedMembersForGym } from '@/modules/roster/roster-queries';

type MembersWorkspaceProps = {
    accessToken: string;
    roleCode: string;
};

/**
 * ADMIN: invites + full roster + trainer picker.
 * TRAINER: assigned clients only (Postman List My Assigned Members).
 */
async function MembersWorkspace({ accessToken, roleCode }: MembersWorkspaceProps) {
    const gymOrgs = await listStaffGymOrgs(accessToken);
    const gym = gymOrgs[0];
    if (!gym) {
        return null;
    }

    const isAdmin = roleCode === 'ADMIN';
    const queryClient = getQueryClient();

    if (isAdmin) {
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

    await queryClient.prefetchQuery({
        queryKey: rosterKeys.assigned(),
        queryFn: () => listMyAssignedMembersForGym({ accessToken, gymOrgId: gym.id }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AssignedMembersPanel />
        </HydrationBoundary>
    );
}

export default async function MembersPage() {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        return null;
    }

    const isAdmin = session.roleCode === 'ADMIN';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg) md:text-3xl">Members</h1>
                <p className="mt-2 max-w-2xl text-sm text-(--color-fg-muted)">
                    {isAdmin
                        ? 'Invite clients by email with a Base plan (optional Trainer add-on). Payment badges are informational — entitlement follows subscription dates after accept.'
                        : 'Clients assigned to you for coaching. Open Profile to view shared vitals and progress.'}
                </p>
            </div>

            <Suspense fallback={<MembersPageSkeleton />}>
                <MembersWorkspace accessToken={session.accessToken} roleCode={session.roleCode} />
            </Suspense>
        </div>
    );
}
