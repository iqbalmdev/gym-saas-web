import type { GymOrgsWriter, CreateGymOrgInput } from "@/lib/modules/gym-orgs/gym-orgs-ports";

export type CreateGymOrgDeps = {
  gymOrgs: GymOrgsWriter;
};

export function createCreateGymOrg(deps: CreateGymOrgDeps) {
  return async function createGymOrg(input: {
    accessToken: string;
    body: CreateGymOrgInput;
  }) {
    return deps.gymOrgs.create(input);
  };
}
