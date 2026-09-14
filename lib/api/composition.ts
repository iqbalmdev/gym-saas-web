import { createHttpClient, getApiBaseUrl } from '@/lib/api/client';
import { attendanceServices } from '@/modules/attendance/attendance-services';
import { authServices } from '@/modules/auth/auth-services';
import { coachingServices } from '@/modules/coaching/coaching-services';
import { gymOrgsServices } from '@/modules/gym-orgs/gym-orgs-services';
import { healthSyncServices } from '@/modules/health-sync/health-sync-services';
import { leadsServices } from '@/modules/leads/leads-services';
import { membershipInvitesServices } from '@/modules/membership-invites/membership-invites-services';
import { nutritionServices } from '@/modules/nutrition/nutrition-services';
import { plansServices } from '@/modules/plans/plans-services';
import { profileServices } from '@/modules/profile/profile-services';
import { rosterServices } from '@/modules/roster/roster-services';
import { staffInvitesServices } from '@/modules/staff-invites/staff-invites-services';
import { subscriptionsServices } from '@/modules/subscriptions/subscriptions-services';

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
        ...profileServices(http),
        ...leadsServices(http),
        ...membershipInvitesServices(http),
        ...rosterServices(http),
        ...attendanceServices(http),
        ...subscriptionsServices(http),
        ...healthSyncServices(http),
        ...nutritionServices(http),
        ...coachingServices(http),
    };
}

export type AppServices = ReturnType<typeof createAppServices>;
