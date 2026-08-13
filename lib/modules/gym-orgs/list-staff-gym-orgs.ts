import { cache } from "react";

import { createAppServices } from "@/lib/api/composition";
import type { GymOrgSummary } from "@/lib/modules/gym-orgs/gym-orgs-ports";

/**
 * Request-scoped gym list for Staff layouts (deduped via React cache).
 */
export const listStaffGymOrgs = cache(
  async (accessToken: string): Promise<readonly GymOrgSummary[]> => {
    const { listGymOrgs } = createAppServices();
    const { gymOrgs } = await listGymOrgs({ accessToken });
    return gymOrgs;
  },
);
