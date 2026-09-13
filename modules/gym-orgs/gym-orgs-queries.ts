import { createAppServices } from '@/lib/api/composition';
import type { GymOrgDetail, GymTrainer } from '@/modules/gym-orgs/gym-orgs-ports';

/** Server-side read for the gym trainer picker (ADR-0011). */
export async function listGymTrainersForGym(input: { accessToken: string; gymOrgId: string }): Promise<GymTrainer[]> {
    const { listGymTrainers } = createAppServices();
    const { trainers } = await listGymTrainers({
        accessToken: input.accessToken,
        gymOrgId: input.gymOrgId,
        limit: 100,
        offset: 0,
    });
    return trainers.items;
}

/** CLIENT ACTIVE membership gym — GET /me/gym (ADR-0011). */
export async function getMyGymForSession(input: { accessToken: string }): Promise<GymOrgDetail> {
    const { getMyGym } = createAppServices();
    const { gymOrg } = await getMyGym({ accessToken: input.accessToken });
    return gymOrg;
}
