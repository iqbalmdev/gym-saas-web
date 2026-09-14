import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireStaffGym } from '@/lib/auth/staff-gym-gate';
import { nutritionErrorMessage } from '@/modules/nutrition/nutrition-errors';
import { getStaffClientCalorieLogForGym } from '@/modules/nutrition/nutrition-queries';

type RouteContext = { params: Promise<{ clientUserId: string }> };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request, context: RouteContext) {
    const gate = await requireStaffGym();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: nutritionErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    const { clientUserId } = await context.params;
    const dateParam = new URL(request.url).searchParams.get('date');
    if (!clientUserId.trim() || (dateParam !== null && !ISO_DATE.test(dateParam))) {
        return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: nutritionErrorMessage('VALIDATION_ERROR') } },
            { status: 422 },
        );
    }

    try {
        const result = await getStaffClientCalorieLogForGym({
            accessToken: gate.session.accessToken,
            gymOrgId: gate.gymOrgId,
            clientUserId,
            date: dateParam ?? undefined,
        });
        if (result.status === 'not_shared') {
            return NextResponse.json(
                {
                    error: {
                        code: 'NUTRITION_FORBIDDEN',
                        message: nutritionErrorMessage('NUTRITION_FORBIDDEN'),
                    },
                },
                { status: 403 },
            );
        }
        return NextResponse.json({ calorieLog: result.data });
    } catch (error) {
        if (error instanceof ApiClientError) {
            return NextResponse.json(
                { error: { code: error.code, message: nutritionErrorMessage(error.code, error.message) } },
                { status: error.status === 0 ? 502 : error.status },
            );
        }
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: nutritionErrorMessage('VALIDATION_ERROR') } },
                { status: 502 },
            );
        }
        return NextResponse.json(
            { error: { code: 'NETWORK_OR_UNKNOWN', message: nutritionErrorMessage('NETWORK_OR_UNKNOWN') } },
            { status: 500 },
        );
    }
}
