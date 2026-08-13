import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled, createE2eStaffInvitesAdapter } from '@/lib/api/e2e-fixtures';
import { createAcceptStaffInvite } from '@/lib/modules/staff-invites/accept-staff-invite';
import { createCreateStaffInvite } from '@/lib/modules/staff-invites/create-staff-invite';
import { createListGymStaffInvites } from '@/lib/modules/staff-invites/list-gym-staff-invites';
import { createListStaffInviteInbox } from '@/lib/modules/staff-invites/list-staff-invite-inbox';
import { createRevokeStaffInvite } from '@/lib/modules/staff-invites/revoke-staff-invite';
import { createStaffInvitesAdapter } from '@/lib/modules/staff-invites/staff-invites-adapter';

/** Binds the staff-invites port to its adapter and use-cases (ADR-0007). */
export function staffInvitesServices(http: HttpClient) {
    const staffInvites = areE2eFixturesEnabled() ? createE2eStaffInvitesAdapter() : createStaffInvitesAdapter(http);
    return {
        staffInvites,
        listGymStaffInvites: createListGymStaffInvites({ staffInvites }),
        listStaffInviteInbox: createListStaffInviteInbox({ staffInvites }),
        createStaffInvite: createCreateStaffInvite({ staffInvites }),
        revokeStaffInvite: createRevokeStaffInvite({ staffInvites }),
        acceptStaffInvite: createAcceptStaffInvite({ staffInvites }),
    };
}
