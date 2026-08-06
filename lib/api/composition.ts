import { createHttpClient, getApiBaseUrl } from "@/lib/api/client";
import { createAuthAdapter } from "@/lib/api/auth-adapter";
import {
  areE2eFixturesEnabled,
  createE2eAuthGateway,
  createE2eGymOrgsAdapter,
} from "@/lib/api/e2e-fixtures";
import { createGymOrgsAdapter } from "@/lib/api/gym-orgs-adapter";
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
  const auth = areE2eFixturesEnabled()
    ? createE2eAuthGateway()
    : createAuthAdapter(createHttpClient({ baseUrl: getApiBaseUrl() }));
  const gymOrgs = areE2eFixturesEnabled()
    ? createE2eGymOrgsAdapter()
    : createGymOrgsAdapter(createHttpClient({ baseUrl: getApiBaseUrl() }));

  return {
    auth,
    gymOrgs,
    requestOtp: createRequestOtp({ auth }),
    verifyOtp: createVerifyOtp({ auth }),
    getCurrentUser: createGetCurrentUser({ auth }),
    listGymOrgs: createListGymOrgs({ gymOrgs }),
    createGymOrg: createCreateGymOrg({ gymOrgs }),
  };
}

export type AppServices = ReturnType<typeof createAppServices>;
