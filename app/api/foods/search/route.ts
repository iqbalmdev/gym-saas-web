import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api/errors';
import { requireClientSession } from '@/lib/auth/client-gate';
import { nutritionErrorMessage } from '@/modules/nutrition/nutrition-errors';
import { searchFoodsForSession } from '@/modules/nutrition/nutrition-queries';

/** Postman caps `q` at 120 characters. */
const MAX_QUERY_LENGTH = 120;

/**
 * The API accepts any authenticated lane, but only the member diary consumes
 * this today — keep the gate as narrow as the caller until a staff surface
 * needs it.
 */
export async function GET(request: Request) {
    const gate = await requireClientSession();
    if (!gate.ok) {
        return NextResponse.json(
            { error: { code: gate.code, message: nutritionErrorMessage(gate.code) } },
            { status: gate.status },
        );
    }

    const query = new URL(request.url).searchParams.get('q') ?? '';
    if (query.length > MAX_QUERY_LENGTH) {
        return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: nutritionErrorMessage('VALIDATION_ERROR') } },
            { status: 422 },
        );
    }

    try {
        const foods = await searchFoodsForSession({ accessToken: gate.session.accessToken, query });
        return NextResponse.json({ foods });
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
