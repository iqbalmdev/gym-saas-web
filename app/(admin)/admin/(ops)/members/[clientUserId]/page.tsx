import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeaderSkeleton } from '@/components/admin/page-header-skeleton';
import { getSession, isStaffSession } from '@/lib/auth/session';
import { getQueryClient } from '@/lib/query/query-client';
import { listStaffGymOrgs } from '@/modules/gym-orgs/list-staff-gym-orgs';
import { StaffClientProfilePanel } from '@/modules/profile/components/staff-client-profile-panel';
import { StaffClientProgressPanel } from '@/modules/profile/components/staff-client-progress-panel';
import { profileKeys } from '@/modules/profile/profile-query-keys';
import { getStaffClientProfileForGym, listStaffClientProgressLogsForGym } from '@/modules/profile/profile-queries';
import { listActiveRosterForGym } from '@/modules/roster/roster-queries';

type MemberDetailPageProps = {
    params: Promise<{ clientUserId: string }>;
};

async function MemberDetailWorkspace({ accessToken, clientUserId }: { accessToken: string; clientUserId: string }) {
    const gymOrgs = await listStaffGymOrgs(accessToken);
    const gym = gymOrgs[0];
    if (!gym) {
        return null;
    }

    const queryClient = getQueryClient();
    const members = await listActiveRosterForGym({ accessToken, gymOrgId: gym.id });
    const member = members.find((item) => item.clientUserId === clientUserId);

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: profileKeys.staffClient(clientUserId),
            queryFn: () => getStaffClientProfileForGym({ accessToken, gymOrgId: gym.id, clientUserId }),
        }),
        queryClient.prefetchQuery({
            queryKey: profileKeys.staffClientLogs(clientUserId),
            queryFn: () => listStaffClientProgressLogsForGym({ accessToken, gymOrgId: gym.id, clientUserId }),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="space-y-6">
                <div>
                    <p className="text-sm text-(--color-fg-muted)">
                        <Link href="/admin/members" className="underline-offset-4 hover:underline">
                            Members
                        </Link>
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-(--color-fg) md:text-3xl">
                        {member?.clientName ?? 'Member'}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-(--color-fg-muted)">
                        Client-owned profile and progress. Missing grants show as not shared — never as invented values.
                    </p>
                </div>
                <StaffClientProfilePanel clientUserId={clientUserId} />
                <StaffClientProgressPanel clientUserId={clientUserId} />
            </div>
        </HydrationBoundary>
    );
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        return null;
    }

    const { clientUserId } = await params;

    return (
        <Suspense fallback={<MemberDetailSkeleton />}>
            <MemberDetailWorkspace accessToken={session.accessToken} clientUserId={clientUserId} />
        </Suspense>
    );
}

function MemberDetailSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            <PageHeaderSkeleton />
            <div className="animate-pulse space-y-3 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5">
                <div className="h-5 w-28 rounded bg-(--color-border)" />
                <div className="h-4 w-full max-w-md rounded bg-(--color-border)" />
            </div>
        </div>
    );
}
