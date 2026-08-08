import { createHttpClient, getApiBaseUrl } from "@/lib/api/client";
import { createAuthAdapter } from "@/lib/api/auth-adapter";
import {
  areE2eFixturesEnabled,
  createE2eAuthGateway,
  createE2eGymOrgsAdapter,
  createE2eStaffInvitesAdapter,
} from "@/lib/api/e2e-fixtures";
import { createGymOrgsAdapter } from "@/lib/api/gym-orgs-adapter";
import { createStaffInvitesAdapter } from "@/lib/api/staff-invites-adapter";
import { createAcceptStaffInvite } from "@/lib/features/staff-invites/accept-staff-invite";
import { createCreateStaffInvite } from "@/lib/features/staff-invites/create-staff-invite";
import { createListGymStaffInvites } from "@/lib/features/staff-invites/list-gym-staff-invites";
import { createListStaffInviteInbox } from "@/lib/features/staff-invites/list-staff-invite-inbox";
import { createRevokeStaffInvite } from "@/lib/features/staff-invites/revoke-staff-invite";
import { createCompleteGoogle } from "@/lib/features/auth/complete-google";
import { createGetCurrentUser } from "@/lib/features/auth/get-current-user";
import { createRequestOtp } from "@/lib/features/auth/request-otp";
import { createVerifyOtp } from "@/lib/features/auth/verify-otp";
import { createCreateGymOrg } from "@/lib/features/gym-orgs/create-gym-org";
import { createListGymOrgs } from "@/lib/features/gym-orgs/list-gym-orgs";

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

  return {
    auth,
    gymOrgs,
    staffInvites,
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
  };
}

export type AppServices = ReturnType<typeof createAppServices>;
