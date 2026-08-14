import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled, createE2eMembershipInvitesAdapter } from '@/lib/api/e2e-fixtures';
import { createMembershipInvitesAdapter } from '@/modules/membership-invites/membership-invites-adapter';
import {
    createAcceptMembershipInvite,
    createCreateMembershipInvite,
    createGetMyDataGrants,
    createListMembershipInviteInbox,
    createListMembershipInvites,
    createRevokeMembershipInvite,
    createUpdateMyDataGrants,
} from '@/modules/membership-invites/membership-invites-use-cases';

/** Binds the membership-invites port to its adapter and use-cases (ADR-0007). */
export function membershipInvitesServices(http: HttpClient) {
    const membershipInvites = areE2eFixturesEnabled()
        ? createE2eMembershipInvitesAdapter()
        : createMembershipInvitesAdapter(http);
    return {
        membershipInvites,
        listMembershipInvites: createListMembershipInvites({ membershipInvites }),
        listMembershipInviteInbox: createListMembershipInviteInbox({
            membershipInvites,
        }),
        createMembershipInvite: createCreateMembershipInvite({ membershipInvites }),
        revokeMembershipInvite: createRevokeMembershipInvite({ membershipInvites }),
        acceptMembershipInvite: createAcceptMembershipInvite({ membershipInvites }),
        getMyDataGrants: createGetMyDataGrants({ membershipInvites }),
        updateMyDataGrants: createUpdateMyDataGrants({ membershipInvites }),
    };
}
