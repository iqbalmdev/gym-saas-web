import { describe, expect, it } from 'vitest';

import type { HttpClient } from '@/lib/api/client';
import { createCoachingAdapter } from '@/modules/coaching/coaching-adapter';

type Recorded = { path: string; method?: string; body?: unknown };

function stubHttp(response: unknown): { http: HttpClient; calls: Recorded[] } {
    const calls: Recorded[] = [];
    const http: HttpClient = {
        request: async <T>(input: { path: string; method?: string; body?: unknown }): Promise<T> => {
            calls.push({ path: input.path, method: input.method, body: input.body });
            return response as T;
        },
    };
    return { http, calls };
}

const DIET_PLAN_BODY = {
    dietPlan: {
        id: 'e1111111-1111-4111-8111-111111111111',
        title: 'Cut week',
        notes: null,
        status: 'ACTIVE',
        writable: true,
        logDate: '2026-08-17',
        meals: [
            {
                id: 'e2222222-2222-4222-8222-222222222222',
                mealSlot: 'BREAKFAST',
                items: [
                    {
                        id: 'd1111111-1111-4111-8111-111111111111',
                        foodItemId: 'f00d0000-0000-4000-8000-000000000001',
                        servingId: 'f00d5e04-0000-4000-8000-000000010003',
                        quantity: 2,
                        mealSlot: 'BREAKFAST',
                        logged: false,
                    },
                ],
            },
        ],
    },
};

const SCHEDULE_BODY = {
    today: '2026-09-02',
    writable: true,
    days: [
        {
            scheduleDate: '2026-09-02',
            kind: 'TRAINING',
            dayDone: false,
            adherencePercent: 0,
            sessions: [
                {
                    id: 's1111111-1111-4111-8111-111111111111',
                    slot: 'MORNING',
                    title: 'Push A',
                    exercises: [
                        {
                            id: 'c1111111-1111-4111-8111-111111111111',
                            name: 'Bench Press (Barbell)',
                            sets: 3,
                            reps: '8-10',
                            completed: false,
                        },
                    ],
                },
            ],
        },
    ],
};

describe('coaching adapter (Postman examples)', () => {
    it('parses Get My Diet Plan', async () => {
        const { http } = stubHttp(DIET_PLAN_BODY);
        const { dietPlan } = await createCoachingAdapter(http).getMyDietPlan({
            accessToken: 'token',
            gymOrgId: 'gym-1',
        });
        expect(dietPlan?.title).toBe('Cut week');
        expect(dietPlan?.meals[0]?.items[0]?.logged).toBe(false);
    });

    it('parses Get My Workout Schedule with from/to query', async () => {
        const { http, calls } = stubHttp(SCHEDULE_BODY);
        const schedule = await createCoachingAdapter(http).getMyWorkoutSchedule({
            accessToken: 'token',
            gymOrgId: 'gym-1',
            from: '2026-09-01',
            to: '2026-09-07',
        });
        expect(calls[0]?.path).toBe('/gym-orgs/gym-1/my-workout-schedule?from=2026-09-01&to=2026-09-07');
        expect(schedule.days[0]?.sessions[0]?.exercises[0]?.name).toBe('Bench Press (Barbell)');
    });

    it('parses Get My Workout Streak', async () => {
        const { http } = stubHttp({
            asOf: '2026-09-02',
            currentStreak: 3,
            longestStreak: 12,
            lookbackDays: 366,
        });
        const streak = await createCoachingAdapter(http).getMyWorkoutStreak({
            accessToken: 'token',
            gymOrgId: 'gym-1',
        });
        expect(streak.currentStreak).toBe(3);
        expect(streak.lookbackDays).toBe(366);
    });

    it('POSTs diet item complete and DELETEs uncomplete on the same path', async () => {
        const completeStub = stubHttp(null);
        await createCoachingAdapter(completeStub.http).completeDietItem({
            accessToken: 'token',
            gymOrgId: 'gym-1',
            itemId: 'd1111111-1111-4111-8111-111111111111',
        });
        expect(completeStub.calls[0]?.method).toBe('POST');
        expect(completeStub.calls[0]?.path).toBe(
            '/gym-orgs/gym-1/my-diet-plan/items/d1111111-1111-4111-8111-111111111111/complete',
        );

        const uncompleteStub = stubHttp(null);
        await createCoachingAdapter(uncompleteStub.http).uncompleteDietItem({
            accessToken: 'token',
            gymOrgId: 'gym-1',
            itemId: 'd1111111-1111-4111-8111-111111111111',
        });
        expect(uncompleteStub.calls[0]?.method).toBe('DELETE');
    });
});
