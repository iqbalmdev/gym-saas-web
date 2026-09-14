import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireClientSession } from '@/lib/auth/client-gate';
import { nutritionErrorMessage } from '@/modules/nutrition/nutrition-errors';
import { getMyCalorieLogForSession } from '@/modules/nutrition/nutrition-queries';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
    const gate = await requireClientSession();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: nutritionErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    const dateParam = new URL(request.url).searchParams.get('date');
    if (dateParam !== null && !ISO_DATE.test(dateParam)) {
        return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: nutritionErrorMessage('VALIDATION_ERROR') } },
            { status: 422 },
        );
    }

    try {
        const calorieLog = await getMyCalorieLogForSession({
            accessToken: gate.session.accessToken,
            date: dateParam ?? undefined,
        });
        return NextResponse.json({ calorieLog });
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
