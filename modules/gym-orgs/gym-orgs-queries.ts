import { createAppServices } from '@/lib/api/composition';
import type { GymTrainer } from '@/modules/gym-orgs/gym-orgs-ports';

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
