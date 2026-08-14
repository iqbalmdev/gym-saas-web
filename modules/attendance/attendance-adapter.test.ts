import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const attendanceSchema = z.object({
    id: z.string().min(1),
    clientUserId: z.string().min(1),
    occurredAt: z.string().min(1),
    recordedBy: z.enum(['CLIENT', 'ADMIN']),
    recorderUserId: z.string().min(1),
    baseStarted: z.boolean(),
});

describe('Attendance schemas (Postman tip 91d4aba)', () => {
    it('parses desk-mark attendance from Examples', () => {
        const attendance = attendanceSchema.parse({
            id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            clientUserId: '22222222-2222-4222-8222-222222222222',
            occurredAt: '2026-08-11T10:00:00.000Z',
            recordedBy: 'ADMIN',
            recorderUserId: '11111111-1111-4111-8111-111111111111',
            baseStarted: false,
        });
        expect(attendance.recordedBy).toBe('ADMIN');
    });

    it('parses day list page envelope', () => {
        const page = z
            .object({
                attendances: z.object({
                    items: z.array(attendanceSchema),
                    total: z.number().int().nonnegative(),
                    limit: z.number().int().positive(),
                    offset: z.number().int().nonnegative(),
                }),
            })
            .parse({
                attendances: {
                    items: [
                        {
                            id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
                            clientUserId: '22222222-2222-4222-8222-222222222222',
                            occurredAt: '2026-08-11T10:00:00.000Z',
                            recordedBy: 'CLIENT',
                            recorderUserId: '22222222-2222-4222-8222-222222222222',
                            baseStarted: false,
                        },
                    ],
                    total: 1,
                    limit: 20,
                    offset: 0,
                },
            });
        expect(page.attendances.total).toBe(1);
    });
});
