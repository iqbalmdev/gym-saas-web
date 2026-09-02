import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeaderSkeleton } from '@/components/admin/page-header-skeleton';
import { getSession, isStaffSession } from '@/lib/auth/session';
import { getQueryClient } from '@/lib/query/query-client';
import { listGymTrainersForGym } from '@/modules/gym-orgs/gym-orgs-queries';
import { listStaffGymOrgs } from '@/modules/gym-orgs/list-staff-gym-orgs';
import { StaffClientWearablesPanel } from '@/modules/health-sync/components/staff-client-wearables-panel';
import { healthSyncKeys } from '@/modules/health-sync/health-sync-query-keys';
import { listStaffClientWearableMetricsForGym } from '@/modules/health-sync/health-sync-queries';
import { StaffClientCalorieLogPanel } from '@/modules/nutrition/components/staff-client-calorie-log-panel';
import { toFoodNameMap } from '@/modules/nutrition/nutrition-food-names';
import { nutritionKeys } from '@/modules/nutrition/nutrition-query-keys';
import { getStaffClientCalorieLogForGym, searchFoodsForSession } from '@/modules/nutrition/nutrition-queries';
import { StaffClientProfilePanel } from '@/modules/profile/components/staff-client-profile-panel';
import { StaffClientProgressPanel } from '@/modules/profile/components/staff-client-progress-panel';
import { profileKeys } from '@/modules/profile/profile-query-keys';
import { getStaffClientProfileForGym, listStaffClientProgressLogsForGym } from '@/modules/profile/profile-queries';
import { MemberAssignmentSummary } from '@/modules/roster/components/member-assignment-summary';
import { listActiveRosterForGym, listMyAssignedMembersForGym } from '@/modules/roster/roster-queries';

type MemberDetailPageProps = {
    params: Promise<{ clientUserId: string }>;
};

async function resolveAssignedTrainerLabel(input: {
    accessToken: string;
    gymOrgId: string;
    isTrainerScoped: boolean;
    assignedTrainerId: string | null;
}): Promise<string> {
    if (!input.assignedTrainerId) {
        return 'Unassigned';
    }
    if (input.isTrainerScoped) {
        return 'You (assigned coach)';
    }
    const trainers = await listGymTrainersForGym({
        accessToken: input.accessToken,
        gymOrgId: input.gymOrgId,
    });
    return trainers.find((item) => item.trainerProfileId === input.assignedTrainerId)?.name ?? 'Assigned';
}

async function MemberDetailWorkspace({
    accessToken,
    clientUserId,
    roleCode,
}: {
    accessToken: string;
    clientUserId: string;
    roleCode: string;
}) {
    const gymOrgs = await listStaffGymOrgs(accessToken);
    const gym = gymOrgs[0];
    if (!gym) {
        return null;
    }

    // Only TRAINER is scoped to their own assignments; other staff roles read the full roster.
    const isTrainerScoped = roleCode === 'TRAINER';
    const queryClient = getQueryClient();

    const members = isTrainerScoped
        ? await listMyAssignedMembersForGym({ accessToken, gymOrgId: gym.id })
        : await listActiveRosterForGym({ accessToken, gymOrgId: gym.id });
    const member = members.find((item) => item.clientUserId === clientUserId);

    const assignedTrainerLabel = await resolveAssignedTrainerLabel({
        accessToken,
        gymOrgId: gym.id,
        isTrainerScoped,
        assignedTrainerId: member?.assignedTrainerId ?? null,
    });

    const [profileResult, progressResult, wearablesResult, diaryResult, foods] = await Promise.all([
        getStaffClientProfileForGym({ accessToken, gymOrgId: gym.id, clientUserId }),
        listStaffClientProgressLogsForGym({ accessToken, gymOrgId: gym.id, clientUserId }),
        listStaffClientWearableMetricsForGym({ accessToken, gymOrgId: gym.id, clientUserId }),
        getStaffClientCalorieLogForGym({ accessToken, gymOrgId: gym.id, clientUserId }),
        // Diary lines carry food ids only; the catalog is what makes them readable.
        searchFoodsForSession({ accessToken, query: '' }),
    ]);

    queryClient.setQueryData(profileKeys.staffClient(clientUserId), profileResult);
    queryClient.setQueryData(profileKeys.staffClientLogs(clientUserId), progressResult);
    queryClient.setQueryData(healthSyncKeys.staffClientMetrics(clientUserId), wearablesResult);
    queryClient.setQueryData(nutritionKeys.staffClientLog(clientUserId), diaryResult);

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
                        Client-owned profile, progress, health sync, and food diary. Missing grants show as not shared —
                        never as invented values. Progress, wearable metrics, and calories each require the member to
                        enable them under Data sharing.
                    </p>
                </div>
                <MemberAssignmentSummary
                    memberEmail={member?.clientEmail ?? null}
                    assignedTrainerLabel={assignedTrainerLabel}
                />
                <StaffClientProfilePanel clientUserId={clientUserId} />
                <StaffClientProgressPanel clientUserId={clientUserId} initial={progressResult} />
                <StaffClientWearablesPanel clientUserId={clientUserId} initial={wearablesResult} />
                <StaffClientCalorieLogPanel
                    clientUserId={clientUserId}
                    foodNames={toFoodNameMap(foods)}
                    initial={diaryResult}
                />
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
            <MemberDetailWorkspace
                accessToken={session.accessToken}
                clientUserId={clientUserId}
                roleCode={session.roleCode}
            />
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
