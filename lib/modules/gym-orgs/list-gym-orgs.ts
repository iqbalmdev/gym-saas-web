import type { GymOrgsReader } from '@/lib/modules/gym-orgs/gym-orgs-ports';

export type ListGymOrgsDeps = {
    gymOrgs: GymOrgsReader;
};

export function createListGymOrgs(deps: ListGymOrgsDeps) {
    return async function listGymOrgs(input: { accessToken: string }) {
        return deps.gymOrgs.list(input);
    };
}
