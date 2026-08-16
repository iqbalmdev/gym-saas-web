import { createAppServices } from '@/lib/api/composition';
import type { RenewalDueItem } from '@/modules/subscriptions/subscriptions-ports';

/** Server-side read for the renewals inbox (ADR-0011). */
export async function listRenewalsDueForGym(input: {
    accessToken: string;
    gymOrgId: string;
    onOrAfter: string;
    onOrBefore: string;
}): Promise<RenewalDueItem[]> {
    const { listRenewalsDue } = createAppServices();
    const { renewals } = await listRenewalsDue(input);
    return renewals.items;
}
