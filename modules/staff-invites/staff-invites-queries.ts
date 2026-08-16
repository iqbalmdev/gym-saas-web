import { createAppServices } from '@/lib/api/composition';
import type { StaffInvite } from '@/modules/staff-invites/staff-invites-ports';

/** Server-side read for a gym's staff invites (ADR-0011). */
export async function listGymStaffInvitesForGym(input: {
    accessToken: string;
    gymOrgId: string;
}): Promise<StaffInvite[]> {
    const { listGymStaffInvites } = createAppServices();
    const { staffInvites } = await listGymStaffInvites(input);
    return staffInvites.items;
}
