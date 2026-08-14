import type { StaffInvitesReader } from '@/modules/staff-invites/staff-invites-ports';

export function createListStaffInviteInbox(deps: { staffInvites: StaffInvitesReader }) {
    return function listStaffInviteInbox(input: { accessToken: string; limit?: number; offset?: number }) {
        return deps.staffInvites.listInbox(input);
    };
}
