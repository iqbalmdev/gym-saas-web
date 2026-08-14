import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const staffInviteGymSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    address: z.string().nullable(),
    contactPhone: z.string().nullable(),
    contactEmail: z.string().nullable(),
    logoUrl: z.string().nullable(),
    timezone: z.string().min(1),
});

const staffInviteSchema = z.object({
    id: z.string().min(1),
    gymOrgId: z.string().min(1),
    gym: staffInviteGymSchema.optional(),
    invitedUserId: z.string().min(1),
    targetRole: z.enum(['TRAINER', 'ADMIN']),
    status: z.enum(['PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED']),
    expiresAt: z.string().min(1),
    createdBy: z.string().min(1),
    acceptedAt: z.string().nullable(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});

const pageSchema = z.object({
    staffInvites: z.object({
        items: z.array(staffInviteSchema),
        total: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        offset: z.number().int().nonnegative(),
    }),
});

const inviteEnvelopeSchema = z.object({
    staffInvite: staffInviteSchema,
});

const postmanInvite = {
    id: '44444444-4444-4444-8444-444444444444',
    gymOrgId: '33333333-3333-4333-8333-333333333333',
    invitedUserId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    targetRole: 'TRAINER',
    status: 'PENDING',
    expiresAt: '2026-08-19T00:00:00.000Z',
    createdBy: '22222222-2222-4222-8222-222222222222',
    acceptedAt: null,
    createdAt: '2026-08-05T00:00:00.000Z',
    updatedAt: '2026-08-05T00:00:00.000Z',
};

describe('Staff invite response schemas (Postman tip 7ae38910)', () => {
    it('parses create/revoke/accept envelope', () => {
        const parsed = inviteEnvelopeSchema.parse({ staffInvite: postmanInvite });
        expect(parsed.staffInvite.targetRole).toBe('TRAINER');
        expect(parsed.staffInvite.acceptedAt).toBeNull();
    });

    it('parses list/inbox page envelope', () => {
        const parsed = pageSchema.parse({
            staffInvites: {
                items: [postmanInvite],
                total: 1,
                limit: 20,
                offset: 0,
            },
        });
        expect(parsed.staffInvites.items).toHaveLength(1);
    });

    it('accepts EXPIRED status from effective list', () => {
        const parsed = staffInviteSchema.parse({
            ...postmanInvite,
            status: 'EXPIRED',
        });
        expect(parsed.status).toBe('EXPIRED');
    });

    it('parses inbox page with embedded gym', () => {
        const parsed = pageSchema.parse({
            staffInvites: {
                items: [
                    {
                        ...postmanInvite,
                        gym: {
                            id: '33333333-3333-4333-8333-333333333333',
                            name: 'North Star Fitness',
                            address: '12 MG Road',
                            contactPhone: '+919876543210',
                            contactEmail: 'desk@northstar.example',
                            logoUrl: null,
                            timezone: 'Asia/Kolkata',
                        },
                    },
                ],
                total: 1,
                limit: 20,
                offset: 0,
            },
        });
        expect(parsed.staffInvites.items[0]?.gym?.name).toBe('North Star Fitness');
    });
});
