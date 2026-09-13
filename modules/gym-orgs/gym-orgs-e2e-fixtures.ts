/**
 * Playwright fixture adapter for the gym-orgs module (`GYM_SAAS_E2E_FIXTURES=1`).
 * Shared state lives in `lib/api/e2e/store.ts`; bound in `gym-orgs-services.ts`.
 */
import type { GymOrgsReader, GymOrgsWriter } from '@/modules/gym-orgs/gym-orgs-ports';
import {
    E2E_CLIENT_TOKEN,
    E2E_GYM_ID,
    E2E_STAFF_TOKEN_WITH_GYM,
    e2eAffiliatedTokens,
    e2eGymTrainers,
    e2eOwnerTokens,
} from '@/lib/api/e2e/store';
import { ApiClientError } from '@/lib/api/errors';

export function createE2eGymOrgsAdapter(): GymOrgsReader & GymOrgsWriter {
    return {
        async list({ accessToken }) {
            if (accessToken === E2E_CLIENT_TOKEN) {
                return { gymOrgs: [] };
            }
            if (accessToken === E2E_STAFF_TOKEN_WITH_GYM || e2eAffiliatedTokens.has(accessToken)) {
                return {
                    gymOrgs: [
                        {
                            id: E2E_GYM_ID,
                            name: 'E2E Gym',
                            timezone: 'Asia/Kolkata',
                            isOwner: accessToken === E2E_STAFF_TOKEN_WITH_GYM,
                        },
                    ],
                };
            }
            return { gymOrgs: [] };
        },

        async getMyGym({ accessToken }) {
            if (accessToken !== E2E_CLIENT_TOKEN) {
                throw new ApiClientError({
                    code: 'GYM_ORG_READ_FORBIDDEN',
                    message: 'Only CLIENT lane may call GET /me/gym',
                    status: 403,
                });
            }
            return {
                gymOrg: {
                    id: E2E_GYM_ID,
                    name: 'E2E Gym',
                    timezone: 'Asia/Kolkata',
                    isOwner: false,
                    address: null,
                    contactPhone: null,
                    contactEmail: null,
                    logoUrl: null,
                    ownerUserId: 'e2e-user-1',
                    createdAt: '2026-08-05T00:00:00.000Z',
                    updatedAt: '2026-08-05T00:00:00.000Z',
                },
            };
        },

        async listTrainers({ gymOrgId, limit = 20, offset = 0 }) {
            const forGym = e2eGymTrainers.filter((trainer) => trainer.gymOrgId === gymOrgId);
            const items = forGym.slice(offset, offset + limit);
            return {
                trainers: {
                    items,
                    total: forGym.length,
                    limit,
                    offset,
                },
            };
        },

        async create({ accessToken, body }) {
            e2eOwnerTokens.add(accessToken);
            e2eAffiliatedTokens.add(accessToken);
            return {
                gymOrg: {
                    id: 'gym-e2e-created',
                    name: body.name,
                    timezone: body.timezone ?? 'Asia/Kolkata',
                    isOwner: true,
                    createdAt: '2026-08-05T00:00:00.000Z',
                },
            };
        },
    };
}
