import { createHttpClient, getApiBaseUrl } from '@/lib/api/client';
import { attendanceServices } from '@/lib/modules/attendance/attendance-services';
import { authServices } from '@/lib/modules/auth/auth-services';
import { gymOrgsServices } from '@/lib/modules/gym-orgs/gym-orgs-services';
import { leadsServices } from '@/lib/modules/leads/leads-services';
import { membershipInvitesServices } from '@/lib/modules/membership-invites/membership-invites-services';
import { plansServices } from '@/lib/modules/plans/plans-services';
import { rosterServices } from '@/lib/modules/roster/roster-services';
import { staffInvitesServices } from '@/lib/modules/staff-invites/staff-invites-services';
import { subscriptionsServices } from '@/lib/modules/subscriptions/subscriptions-services';

/**
 * Composition root — the only place that binds ports → adapters (DIP).
 * Each module owns its binding in `<module>-services.ts` (ADR-0007), so adding
 * a module is one import plus one spread here rather than ~20 lines spread
 * across three files every other module also edits.
 * Playwright sets `GYM_SAAS_E2E_FIXTURES=1`; each module swaps in its own fake.
 */
export function createAppServices() {
    const http = createHttpClient({ baseUrl: getApiBaseUrl() });

    return {
        ...authServices(http),
        ...gymOrgsServices(http),
        ...staffInvitesServices(http),
        ...plansServices(http),
        ...leadsServices(http),
        ...membershipInvitesServices(http),
        ...rosterServices(http),
        ...attendanceServices(http),
        ...subscriptionsServices(http),
    };
}

export type AppServices = ReturnType<typeof createAppServices>;
