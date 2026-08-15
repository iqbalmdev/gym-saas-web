import type { StaffInvitesReader } from '@/modules/staff-invites/staff-invites-ports';

export function createListGymStaffInvites(deps: { staffInvites: StaffInvitesReader }) {
    return function listGymStaffInvites(input: {
        accessToken: string;
        gymOrgId: string;
        limit?: number;
        offset?: number;
    }) {
        return deps.staffInvites.listForGym(input);
    };
}
