import type { StaffInvitesWriter } from '@/modules/staff-invites/staff-invites-ports';

export function createRevokeStaffInvite(deps: { staffInvites: StaffInvitesWriter }) {
    return function revokeStaffInvite(input: { accessToken: string; inviteId: string }) {
        return deps.staffInvites.revoke(input);
    };
}
