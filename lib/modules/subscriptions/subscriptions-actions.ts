'use server';

import { revalidatePath } from 'next/cache';

import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { getSession } from '@/lib/auth/session';
import { subscriptionErrorMessage } from '@/lib/modules/subscriptions/subscriptions-errors';
import type { SubscriptionPaymentStatus } from '@/lib/modules/subscriptions/subscriptions-ports';

export type SubscriptionActionResult = { ok: true } | { ok: false; code: string; message: string };

function fail(error: unknown): SubscriptionActionResult {
    if (error instanceof ApiClientError) {
        return {
            ok: false,
            code: error.code,
            message: subscriptionErrorMessage(error.code, error.message),
        };
    }
    if (error instanceof Error && error.name === 'ZodError') {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: subscriptionErrorMessage('VALIDATION_ERROR'),
        };
    }
    return {
        ok: false,
        code: 'NETWORK_OR_UNKNOWN',
        message: subscriptionErrorMessage('NETWORK_OR_UNKNOWN'),
    };
}

/** Auth + STAFF + gym tenant. API enforces ADMIN. No DataGrant (gym-owned). */
async function requireStaffAdminGym(): Promise<
    { ok: true; accessToken: string; gymOrgId: string } | { ok: false; result: SubscriptionActionResult }
> {
    const session = await getSession();
    if (!session || session.lane !== 'STAFF') {
        return {
            ok: false,
            result: {
                ok: false,
                code: 'AUTHENTICATION_FAILED',
                message: subscriptionErrorMessage('AUTHENTICATION_FAILED'),
            },
        };
    }
    const { listGymOrgs } = createAppServices();
    const { gymOrgs } = await listGymOrgs({ accessToken: session.accessToken });
    const gymOrgId = gymOrgs[0]?.id;
    if (!gymOrgId) {
        return {
            ok: false,
            result: {
                ok: false,
                code: 'FORBIDDEN',
                message: subscriptionErrorMessage('FORBIDDEN'),
            },
        };
    }
    return { ok: true, accessToken: session.accessToken, gymOrgId };
}

function isPaymentStatus(value: string): value is SubscriptionPaymentStatus {
    return value === 'paid' || value === 'unpaid' || value === 'partial';
}

export async function updateSubscriptionPaymentAction(input: {
    subscriptionId: string;
    paymentStatus: string;
    amountPaid?: number;
}): Promise<SubscriptionActionResult> {
    const gate = await requireStaffAdminGym();
    if (!gate.ok) {
        return gate.result;
    }
    const subscriptionId = input.subscriptionId.trim();
    if (!subscriptionId || !isPaymentStatus(input.paymentStatus)) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: subscriptionErrorMessage('VALIDATION_ERROR'),
        };
    }
    if (input.paymentStatus === 'partial' && (input.amountPaid === undefined || Number.isNaN(input.amountPaid))) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Partial payment requires an amount paid.',
        };
    }
    try {
        const { updateSubscriptionPayment } = createAppServices();
        await updateSubscriptionPayment({
            accessToken: gate.accessToken,
            gymOrgId: gate.gymOrgId,
            subscriptionId,
            body: {
                paymentStatus: input.paymentStatus,
                ...(input.amountPaid !== undefined ? { amountPaid: input.amountPaid } : {}),
            },
        });
        revalidatePath('/admin/renewals');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}
