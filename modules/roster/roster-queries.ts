import { createAppServices } from '@/lib/api/composition';
import type { RosterMember } from '@/modules/roster/roster-ports';

/** Server-side read for the active roster (ADR-0011). */
export async function listActiveRosterForGym(input: {
    accessToken: string;
    gymOrgId: string;
}): Promise<RosterMember[]> {
    const { listRosterMembers } = createAppServices();
    const { members } = await listRosterMembers({
        accessToken: input.accessToken,
        gymOrgId: input.gymOrgId,
        status: 'ACTIVE',
    });
    return members;
}
