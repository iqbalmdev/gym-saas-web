'use client';

import { useQuery } from '@tanstack/react-query';

import { getJson } from '@/lib/query/api-fetch';
import { gymOrgErrorMessage } from '@/modules/gym-orgs/gym-orgs-errors';
import type { GymOrgDetail, GymTrainer } from '@/modules/gym-orgs/gym-orgs-ports';
import { gymOrgsKeys } from '@/modules/gym-orgs/gym-orgs-query-keys';

/** CLIENT ACTIVE membership gym — cached for coaching gym-scoped reads. */
export function useMyGym(initial?: GymOrgDetail) {
    return useQuery({
        queryKey: gymOrgsKeys.myGym(),
        initialData: initial,
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const { gymOrg } = await getJson<{ gymOrg: GymOrgDetail }>(
                '/api/me/gym',
                gymOrgErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return gymOrg;
        },
    });
}

/** Live trainer_profiles at the session gym — GET /gym-orgs/:id/trainers via BFF. */
export function useGymTrainers() {
    return useQuery({
        queryKey: gymOrgsKeys.trainers(),
        queryFn: async () => {
            const { trainers } = await getJson<{ trainers: GymTrainer[] }>(
                '/api/gym-orgs/trainers',
                gymOrgErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return trainers;
        },
    });
}
