import type { StaffInvitesWriter } from '@/modules/staff-invites/staff-invites-ports';

export function createAcceptStaffInvite(deps: { staffInvites: StaffInvitesWriter }) {
    return function acceptStaffInvite(input: { accessToken: string; inviteId: string }) {
        return deps.staffInvites.accept(input);
    };
}
