import type { GymOrgsReader } from '@/modules/gym-orgs/gym-orgs-ports';

export function createGetMyGym(deps: { gymOrgs: GymOrgsReader }) {
    return async function getMyGym(input: Parameters<GymOrgsReader['getMyGym']>[0]) {
        return deps.gymOrgs.getMyGym(input);
    };
}
