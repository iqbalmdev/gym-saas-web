import { describe, expect, it } from 'vitest';
import { z } from 'zod';

/**
 * Mirrors create response parse rules in gym-orgs-adapter (Postman 201 example).
 * Keeps the create/list schema split from regressing.
 */
const createGymOrgDetailSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    timezone: z.string().min(1),
    ownerUserId: z.string().optional(),
    address: z.string().nullable().optional(),
    contactPhone: z.string().nullable().optional(),
    contactEmail: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    isOwner: z.boolean().optional(),
});

const createSchema = z.object({
    gymOrg: createGymOrgDetailSchema,
});

describe('POST /gym-orgs create response schema', () => {
    it('accepts Postman 201 body without isOwner', () => {
        const raw = {
            gymOrg: {
                id: '33333333-3333-4333-8333-333333333333',
                name: 'North Star Fitness',
                address: null,
                contactPhone: null,
                contactEmail: 'hello@example.com',
                logoUrl: null,
                timezone: 'Asia/Kolkata',
                ownerUserId: '22222222-2222-4222-8222-222222222222',
                createdAt: '2026-08-03T00:00:00.000Z',
                updatedAt: '2026-08-03T00:00:00.000Z',
            },
        };

        const parsed = createSchema.parse(raw);
        expect(parsed.gymOrg.name).toBe('North Star Fitness');
        expect(parsed.gymOrg.isOwner).toBeUndefined();
    });

    it('rejects missing name', () => {
        expect(() =>
            createSchema.parse({
                gymOrg: {
                    id: '1',
                    timezone: 'Asia/Kolkata',
                },
            }),
        ).toThrow();
    });
});
