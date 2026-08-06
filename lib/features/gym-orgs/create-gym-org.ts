import type { GymOrgsWriter, CreateGymOrgInput } from "@/lib/ports/gym-orgs";

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
