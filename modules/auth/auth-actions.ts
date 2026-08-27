'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { redirect } from 'next/navigation';

import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { buildSessionSnapshot, clearSession, getSession, setSession, type SessionSnapshot } from '@/lib/auth/session';
import { authErrorMessage } from '@/modules/auth/auth-errors';
import { resolvePostAuthPath } from '@/modules/auth/resolve-post-auth-path';
import type { AuthLane } from '@/modules/auth/auth-ports';
import type { CreateGymOrgInput } from '@/modules/gym-orgs/gym-orgs-ports';

export type AuthActionResult = { ok: true; isNewUser?: boolean } | { ok: false; code: string; message: string };

function fail(error: unknown): AuthActionResult {
    if (error instanceof ApiClientError) {
        return {
            ok: false,
            code: error.code,
            message: authErrorMessage(error.code, error.message),
        };
    }
    if (error instanceof Error && error.name === 'ZodError') {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Could not read the server response. Please try again.',
        };
    }
    return {
        ok: false,
        code: 'NETWORK_OR_UNKNOWN',
        message: authErrorMessage('NETWORK_OR_UNKNOWN'),
    };
}

async function staffGymOrgCount(accessToken: string): Promise<number> {
    const { listGymOrgs } = createAppServices();
    const { gymOrgs } = await listGymOrgs({ accessToken });
    return gymOrgs.length;
}

async function redirectAfterAuth(snapshot: SessionSnapshot): Promise<never> {
    let gymOrgCount = 0;
    if (snapshot.lane === 'STAFF') {
        try {
            gymOrgCount = await staffGymOrgCount(snapshot.accessToken);
        } catch {
            gymOrgCount = 0;
        }
    }
    redirect(resolvePostAuthPath({ lane: snapshot.lane, gymOrgCount }));
}

export async function requestOtpAction(input: { email: string }): Promise<AuthActionResult> {
    const email = input.email.trim().toLowerCase();
    if (!email.includes('@')) {
        return {
            ok: false,
            code: 'EMAIL_ADDRESS_INVALID',
            message: authErrorMessage('EMAIL_ADDRESS_INVALID'),
        };
    }

    try {
        const { requestOtp } = createAppServices();
        const result = await requestOtp({ email });
        return { ok: true, isNewUser: result.isNewUser };
    } catch (error) {
        return fail(error);
    }
}

/** @deprecated Use requestOtpAction — kept briefly for any stale imports. */
export async function requestStaffOtpAction(input: { email: string }): Promise<AuthActionResult> {
    return requestOtpAction(input);
}

export async function verifyOtpAction(input: {
    email: string;
    token: string;
    lane?: AuthLane;
    name?: string;
}): Promise<AuthActionResult> {
    const email = input.email.trim().toLowerCase();
    const token = input.token.trim();
    const name = input.name?.trim();
    const lane = input.lane;

    if (!/^\d{6,12}$/.test(token)) {
        return {
            ok: false,
            code: 'OTP_EXPIRED',
            message: authErrorMessage('OTP_EXPIRED'),
        };
    }

    try {
        const { verifyOtp } = createAppServices();
        const result = await verifyOtp({
            email,
            token,
            lane,
            name: name || undefined,
        });

        const snapshot = buildSessionSnapshot(result.session, result.user);
        await setSession(snapshot);
        await redirectAfterAuth(snapshot);
        return { ok: true };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return fail(error);
    }
}

/** @deprecated Use verifyOtpAction */
export async function verifyStaffOtpAction(input: {
    email: string;
    token: string;
    name?: string;
}): Promise<AuthActionResult> {
    return verifyOtpAction({ ...input, lane: 'STAFF' });
}

/**
 * Finish Google OAuth after the browser lands on `/auth/google/callback` with
 * tokens in the URL hash. Keep the Google session tokens (API does not rotate).
 */
export async function completeGoogleAction(input: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    lane: AuthLane;
    name?: string;
}): Promise<AuthActionResult> {
    const accessToken = input.accessToken.trim();
    const refreshToken = input.refreshToken.trim();
    const name = input.name?.trim();
    const lane = input.lane;
    const expiresIn = Number.isFinite(input.expiresIn) && input.expiresIn > 0 ? Math.floor(input.expiresIn) : 3600;

    if (!accessToken || !refreshToken) {
        return {
            ok: false,
            code: 'AUTHENTICATION_FAILED',
            message: authErrorMessage('AUTHENTICATION_FAILED'),
        };
    }

    try {
        const { completeGoogle } = createAppServices();
        const { user } = await completeGoogle({
            accessToken,
            lane,
            name: name || undefined,
        });

        const snapshot = buildSessionSnapshot({ accessToken, refreshToken, expiresIn }, user);
        await setSession(snapshot);
        await redirectAfterAuth(snapshot);
        return { ok: true };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return fail(error);
    }
}

export async function createGymOrgAction(input: {
    name: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    timezone?: string;
}): Promise<AuthActionResult> {
    const session = await getSession();
    if (!session || session.lane !== 'STAFF') {
        return {
            ok: false,
            code: 'AUTHENTICATION_FAILED',
            message: authErrorMessage('AUTHENTICATION_FAILED'),
        };
    }

    const name = input.name.trim();
    if (name.length < 2) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Enter a gym name (at least 2 characters).',
        };
    }

    const body: CreateGymOrgInput = {
        name,
        timezone: input.timezone?.trim() || 'Asia/Kolkata',
    };
    const contactEmail = input.contactEmail?.trim();
    if (contactEmail) {
        body.contactEmail = contactEmail;
    }
    const contactPhone = input.contactPhone?.trim();
    if (contactPhone) {
        body.contactPhone = contactPhone;
    }
    const address = input.address?.trim();
    if (address) {
        body.address = address;
    }

    try {
        const { createGymOrg, getCurrentUser } = createAppServices();
        await createGymOrg({ accessToken: session.accessToken, body });

        try {
            const { user } = await getCurrentUser({
                accessToken: session.accessToken,
            });
            await setSession(
                buildSessionSnapshot(
                    {
                        accessToken: session.accessToken,
                        refreshToken: session.refreshToken,
                        expiresIn: Math.max(60, Math.floor((session.expiresAt - Date.now()) / 1000)),
                    },
                    user,
                ),
            );
        } catch {
            // Create succeeded; session refresh is best-effort.
        }

        redirect('/admin/settings');
        return { ok: true };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return fail(error);
    }
}

export async function signOutAction(): Promise<void> {
    await clearSession();
    redirect('/login');
}
