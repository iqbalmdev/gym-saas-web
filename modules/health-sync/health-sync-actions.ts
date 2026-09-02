'use server';

import { revalidatePath } from 'next/cache';

import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { getSession } from '@/lib/auth/session';
import { healthSyncErrorMessage } from '@/modules/health-sync/health-sync-errors';
import type { WearableProvider } from '@/modules/health-sync/health-sync-ports';

export type HealthSyncActionResult = { ok: true } | { ok: false; code: string; message: string };

const PROVIDERS = new Set<WearableProvider>(['APPLE_HEALTH', 'HEALTH_CONNECT', 'SAMSUNG_HEALTH']);

function fail(error: unknown): HealthSyncActionResult {
    if (error instanceof ApiClientError) {
        return {
            ok: false,
            code: error.code,
            message: healthSyncErrorMessage(error.code, error.message),
        };
    }
    if (error instanceof Error && error.name === 'ZodError') {
        return { ok: false, code: 'VALIDATION_ERROR', message: healthSyncErrorMessage('VALIDATION_ERROR') };
    }
    return { ok: false, code: 'NETWORK_OR_UNKNOWN', message: healthSyncErrorMessage('NETWORK_OR_UNKNOWN') };
}

async function requireClient(): Promise<
    { ok: true; accessToken: string } | { ok: false; result: HealthSyncActionResult }
> {
    const session = await getSession();
    if (!session || session.lane !== 'CLIENT') {
        return {
            ok: false,
            result: {
                ok: false,
                code: 'AUTHENTICATION_FAILED',
                message: healthSyncErrorMessage('AUTHENTICATION_FAILED'),
            },
        };
    }
    return { ok: true, accessToken: session.accessToken };
}

function parseProvider(raw: string): WearableProvider | null {
    const trimmed = raw.trim();
    return PROVIDERS.has(trimmed as WearableProvider) ? (trimmed as WearableProvider) : null;
}

export async function connectWearableAction(input: { provider: string }): Promise<HealthSyncActionResult> {
    const gate = await requireClient();
    if (!gate.ok) {
        return gate.result;
    }

    const provider = parseProvider(input.provider);
    if (!provider) {
        return { ok: false, code: 'VALIDATION_ERROR', message: healthSyncErrorMessage('VALIDATION_ERROR') };
    }

    try {
        const { connectWearable } = createAppServices();
        await connectWearable({ accessToken: gate.accessToken, provider });
        revalidatePath('/client/health');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function disconnectWearableAction(input: { provider: string }): Promise<HealthSyncActionResult> {
    const gate = await requireClient();
    if (!gate.ok) {
        return gate.result;
    }

    const provider = parseProvider(input.provider);
    if (!provider) {
        return { ok: false, code: 'VALIDATION_ERROR', message: healthSyncErrorMessage('VALIDATION_ERROR') };
    }

    try {
        const { disconnectWearable } = createAppServices();
        await disconnectWearable({ accessToken: gate.accessToken, provider });
        revalidatePath('/client/health');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}
