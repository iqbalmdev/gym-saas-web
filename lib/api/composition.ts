import { createHttpClient, getApiBaseUrl } from "@/lib/api/client";
import { createAuthAdapter } from "@/lib/api/auth-adapter";
import {
  areE2eFixturesEnabled,
  createE2eAuthGateway,
  createE2eGymOrgsAdapter,
  createE2eLeadsAdapter,
  createE2ePlansAdapter,
  createE2eStaffInvitesAdapter,
} from "@/lib/api/e2e-fixtures";
import { createGymOrgsAdapter } from "@/lib/api/gym-orgs-adapter";
import { createLeadsAdapter } from "@/lib/api/leads-adapter";
import { createPlansAdapter } from "@/lib/api/plans-adapter";
import { createStaffInvitesAdapter } from "@/lib/api/staff-invites-adapter";
import { createCompleteGoogle } from "@/lib/features/auth/complete-google";
import { createGetCurrentUser } from "@/lib/features/auth/get-current-user";
import { createRequestOtp } from "@/lib/features/auth/request-otp";
import { createVerifyOtp } from "@/lib/features/auth/verify-otp";
import { createCreateGymOrg } from "@/lib/features/gym-orgs/create-gym-org";
import { createListGymOrgs } from "@/lib/features/gym-orgs/list-gym-orgs";
import {
  createChangeLeadStatus,
  createCreateLead,
  createListDueFollowUps,
  createListLeads,
  createSoftDeleteLead,
  createUpdateLead,
} from "@/lib/features/leads/use-cases";
import {
  createCreatePlan,
  createListPlans,
  createSoftDeletePlan,
  createUpdatePlan,
} from "@/lib/features/plans/use-cases";
import { createAcceptStaffInvite } from "@/lib/features/staff-invites/accept-staff-invite";
import { createCreateStaffInvite } from "@/lib/features/staff-invites/create-staff-invite";
import { createListGymStaffInvites } from "@/lib/features/staff-invites/list-gym-staff-invites";
import { createListStaffInviteInbox } from "@/lib/features/staff-invites/list-staff-invite-inbox";
import { createRevokeStaffInvite } from "@/lib/features/staff-invites/revoke-staff-invite";

/**
 * Composition root — the only place that binds ports → HTTP adapters (DIP).
 * Route handlers / server components call these factories; features never import adapters.
 * Playwright sets `GYM_SAAS_E2E_FIXTURES=1` so RSC/server actions use deterministic fakes.
 */
export function createAppServices() {
  const http = createHttpClient({ baseUrl: getApiBaseUrl() });
  const auth = areE2eFixturesEnabled()
    ? createE2eAuthGateway()
    : createAuthAdapter(http);
  const gymOrgs = areE2eFixturesEnabled()
    ? createE2eGymOrgsAdapter()
    : createGymOrgsAdapter(http);
  const staffInvites = areE2eFixturesEnabled()
    ? createE2eStaffInvitesAdapter()
    : createStaffInvitesAdapter(http);
  const plans = areE2eFixturesEnabled()
    ? createE2ePlansAdapter()
    : createPlansAdapter(http);
  const leads = areE2eFixturesEnabled()
    ? createE2eLeadsAdapter()
    : createLeadsAdapter(http);

  return {
    auth,
    gymOrgs,
    staffInvites,
    plans,
    leads,
    requestOtp: createRequestOtp({ auth }),
    verifyOtp: createVerifyOtp({ auth }),
    completeGoogle: createCompleteGoogle({ auth }),
    getCurrentUser: createGetCurrentUser({ auth }),
    listGymOrgs: createListGymOrgs({ gymOrgs }),
    createGymOrg: createCreateGymOrg({ gymOrgs }),
    listGymStaffInvites: createListGymStaffInvites({ staffInvites }),
    listStaffInviteInbox: createListStaffInviteInbox({ staffInvites }),
    createStaffInvite: createCreateStaffInvite({ staffInvites }),
    revokeStaffInvite: createRevokeStaffInvite({ staffInvites }),
    acceptStaffInvite: createAcceptStaffInvite({ staffInvites }),
    listPlans: createListPlans({ plans }),
    createPlan: createCreatePlan({ plans }),
    updatePlan: createUpdatePlan({ plans }),
    softDeletePlan: createSoftDeletePlan({ plans }),
    listLeads: createListLeads({ leads }),
    listDueFollowUps: createListDueFollowUps({ leads }),
    createLead: createCreateLead({ leads }),
    updateLead: createUpdateLead({ leads }),
    changeLeadStatus: createChangeLeadStatus({ leads }),
    softDeleteLead: createSoftDeleteLead({ leads }),
  };
}

export type AppServices = ReturnType<typeof createAppServices>;
