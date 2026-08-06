import type { GymOrgsReader } from "@/lib/ports/gym-orgs";

export type ListGymOrgsDeps = {
  gymOrgs: GymOrgsReader;
};

export function createListGymOrgs(deps: ListGymOrgsDeps) {
  return async function listGymOrgs(input: { accessToken: string }) {
    return deps.gymOrgs.list(input);
  };
}
