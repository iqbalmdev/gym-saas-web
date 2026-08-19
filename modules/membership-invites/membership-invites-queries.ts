import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import type { MembershipInvite, MyDataGrants } from '@/modules/membership-invites/membership-invites-ports';
import type { MembershipPlan } from '@/modules/plans/plans-ports';

export type MembershipInvitesPageData = {
    invites: MembershipInvite[];
    basePlans: MembershipPlan[];
    addonPlans: MembershipPlan[];
};

/**
 * Server-side read for the members page (ADR-0011).
 *
 * Plans ride along because the invite form needs them to populate its
 * selects — they are part of this screen's payload, not a separate concern
 * the user can act on here.
 */
export async function listMembershipInvitesPageForGym(input: {
    accessToken: string;
    gymOrgId: string;
}): Promise<MembershipInvitesPageData> {
    const { listMembershipInvites, listPlans } = createAppServices();
    const [invitePage, basePage, addonPage] = await Promise.all([
        listMembershipInvites({ accessToken: input.accessToken, gymOrgId: input.gymOrgId }),
        listPlans({ accessToken: input.accessToken, gymOrgId: input.gymOrgId, kind: 'BASE', active: true }),
        listPlans({ accessToken: input.accessToken, gymOrgId: input.gymOrgId, kind: 'ADDON', active: true }),
    ]);

    return {
        invites: invitePage.membershipInvites.items,
        basePlans: basePage.plans.items,
        addonPlans: addonPage.plans.items,
    };
}

export type ClientGrantsPanel = {
    gymOrgId: string;
    gymName?: string;
    dataGrants: MyDataGrants;
};

export type ClientHomeData = {
    invites: MembershipInvite[];
    grantsPanels: ClientGrantsPanel[];
};

/**
 * Server-side read for the CLIENT member home (ADR-0011): the invite inbox plus
 * one data-sharing panel per gym where this client has an ACTIVE membership.
 *
 * Grants are fetched per gym because there is no bulk endpoint. A 404 means
 * "no ACTIVE membership at that gym" — an expected state (the invite is still
 * pending), so the panel is simply omitted rather than surfaced as an error.
 * Other per-gym failures are swallowed for the same reason: they must not take
 * down the invite inbox, which is the screen's primary job.
 */
export async function getClientHomeForSession(input: { accessToken: string }): Promise<ClientHomeData> {
    const { listMembershipInviteInbox, getMyDataGrants } = createAppServices();
    const { membershipInvites } = await listMembershipInviteInbox({ accessToken: input.accessToken });
    const invites = membershipInvites.items;

    const gymCandidates = new Map<string, string | undefined>();
    for (const invite of invites) {
        if (invite.gymOrgId) {
            gymCandidates.set(invite.gymOrgId, invite.gym?.name);
        }
    }

    const settled = await Promise.all(
        [...gymCandidates].map(async ([gymOrgId, gymName]): Promise<ClientGrantsPanel | null> => {
            try {
                const { dataGrants } = await getMyDataGrants({ accessToken: input.accessToken, gymOrgId });
                return { gymOrgId, gymName, dataGrants };
            } catch (error) {
                if (error instanceof ApiClientError && (error.status === 404 || error.code === 'NOT_FOUND')) {
                    return null;
                }
                return null;
            }
        }),
    );

    return { invites, grantsPanels: settled.filter((panel) => panel !== null) };
}
