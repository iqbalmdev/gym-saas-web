import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import type { SessionSnapshot } from '@/lib/auth/session';
import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { getQueryClient } from '@/lib/query/query-client';
import { CreateGymForm } from '@/modules/gym-orgs/components/create-gym-form';
import { StaffInviteInbox } from '@/modules/staff-invites/components/staff-invite-inbox';
import { StaffInvitesAdminPanel } from '@/modules/staff-invites/components/staff-invites-admin-panel';
import { staffInviteErrorMessage } from '@/modules/staff-invites/staff-invites-errors';
import type { StaffInvite } from '@/modules/staff-invites/staff-invites-ports';
import { staffInvitesKeys } from '@/modules/staff-invites/staff-invites-query-keys';
import { listGymStaffInvitesForGym } from '@/modules/staff-invites/staff-invites-queries';

type SettingsDataProps = {
    session: SessionSnapshot;
};

/**
 * Async boundary for the Settings page — resolves the active GymOrg (or
 * lack of one), then loads the branch-appropriate list. Isolated behind a
 * <Suspense> in the page so the "Settings" heading can paint first. Almost
 * every visible piece here is conditional on the GymOrg lookup itself (this
 * page is the Settings-first gate for 0-gym Staff), so unlike the other ops
 * pages there's little to hoist above the boundary beyond the bare heading.
 */
export async function SettingsData({ session }: SettingsDataProps) {
    const { listGymOrgs, listStaffInviteInbox } = createAppServices();
    let gymName = 'your gym';
    let gymOrgId: string | null = null;
    let inbox: StaffInvite[] = [];
    let inboxError: string | null = null;
    const queryClient = getQueryClient();

    try {
        const { gymOrgs } = await listGymOrgs({ accessToken: session.accessToken });
        const active = gymOrgs[0];
        if (active) {
            gymOrgId = active.id;
            gymName = active.name;
        }
    } catch {
        // A failed gym lookup leaves `gymOrgId` null, so the inbox branch below
        // renders and reports through `inboxError`. The invite-list error is
        // now owned by useGymStaffInvites inside the admin panel.
    }

    if (gymOrgId) {
        // Admin branch only: the invite list is TanStack-owned (ADR-0011).
        // The inbox branch below stays server-rendered — accepting an invite
        // changes gym affiliation, and therefore the Admin shell's mode, which
        // only a router refresh can re-render.
        const activeGymOrgId = gymOrgId;
        await queryClient.prefetchQuery({
            queryKey: staffInvitesKeys.gymList(),
            queryFn: () => listGymStaffInvitesForGym({ accessToken: session.accessToken, gymOrgId: activeGymOrgId }),
        });
    } else {
        try {
            const { staffInvites } = await listStaffInviteInbox({ accessToken: session.accessToken });
            inbox = staffInvites.items;
        } catch (error) {
            inboxError =
                error instanceof ApiClientError
                    ? staffInviteErrorMessage(error.code, error.message)
                    : staffInviteErrorMessage('NETWORK_OR_UNKNOWN');
        }
    }

    const canCreateGym = !gymOrgId && (session.roleCode === 'STAFF_UNASSIGNED' || session.roleCode === 'ADMIN');

    return (
        <>
            <p className="max-w-2xl text-sm text-(--color-fg-muted)">
                {gymOrgId
                    ? `Managing ${gymName}. Invite Trainers and desk Admins with an existing staff code.`
                    : 'Create your GymOrg to unlock Admin tools, or accept a staff invite if a gym already invited you.'}
            </p>

            {session.staffCode ? (
                <p className="text-sm text-(--color-fg-muted)">
                    Your staff code: <span className="font-medium text-(--color-fg)">{session.staffCode}</span>
                </p>
            ) : null}

            {gymOrgId ? (
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <StaffInvitesAdminPanel gymName={gymName} />
                </HydrationBoundary>
            ) : (
                <>
                    <StaffInviteInbox invites={inbox} listError={inboxError} staffCode={session.staffCode} />
                    {canCreateGym ? (
                        <section className="space-y-4" aria-labelledby="create-gym-heading">
                            <div>
                                <h2
                                    id="create-gym-heading"
                                    className="text-lg font-semibold tracking-tight text-(--color-fg)"
                                >
                                    Create your gym
                                </h2>
                                <p className="mt-1 text-sm text-(--color-fg-muted)">
                                    You become the owner Admin. Then invite staff from this page.
                                </p>
                            </div>
                            <CreateGymForm />
                        </section>
                    ) : null}
                </>
            )}
        </>
    );
}
