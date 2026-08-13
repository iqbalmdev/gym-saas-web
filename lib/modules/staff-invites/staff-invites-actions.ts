'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { buildSessionSnapshot, getSession, setSession } from '@/lib/auth/session';
import { staffInviteErrorMessage } from '@/lib/modules/staff-invites/staff-invites-errors';
import type { CreateStaffInviteInput, StaffInviteTargetRole } from '@/lib/modules/staff-invites/staff-invites-ports';

export type StaffInviteActionResult = { ok: true } | { ok: false; code: string; message: string };

function fail(error: unknown): StaffInviteActionResult {
    if (error instanceof ApiClientError) {
        return {
            ok: false,
            code: error.code,
            message: staffInviteErrorMessage(error.code, error.message),
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
        message: staffInviteErrorMessage('NETWORK_OR_UNKNOWN'),
    };
}

async function requireStaffSession() {
    const session = await getSession();
    if (!session || session.lane !== 'STAFF') {
        return null;
    }
    return session;
}

async function resolveActiveGymOrgId(accessToken: string): Promise<string | null> {
    const { listGymOrgs } = createAppServices();
    const { gymOrgs } = await listGymOrgs({ accessToken });
    return gymOrgs[0]?.id ?? null;
}

export async function createStaffInviteAction(input: {
    staffCode: string;
    targetRole: StaffInviteTargetRole;
}): Promise<StaffInviteActionResult> {
    const session = await requireStaffSession();
    if (!session) {
        return {
            ok: false,
            code: 'AUTHENTICATION_FAILED',
            message: staffInviteErrorMessage('AUTHENTICATION_FAILED'),
        };
    }

    const staffCode = input.staffCode.trim().toUpperCase();
    if (staffCode.length < 3) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Enter the invitee’s staff code (from their account).',
        };
    }

    if (input.targetRole !== 'TRAINER' && input.targetRole !== 'ADMIN') {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Choose Trainer or Admin for the invite.',
        };
    }

    try {
        const gymOrgId = await resolveActiveGymOrgId(session.accessToken);
        if (!gymOrgId) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                message: 'Create your gym before inviting staff.',
            };
        }

        const body: CreateStaffInviteInput = {
            staffCode,
            targetRole: input.targetRole,
        };
        const { createStaffInvite } = createAppServices();
        await createStaffInvite({
            accessToken: session.accessToken,
            gymOrgId,
            body,
        });
        revalidatePath('/admin/settings');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function revokeStaffInviteAction(input: { inviteId: string }): Promise<StaffInviteActionResult> {
    const session = await requireStaffSession();
    if (!session) {
        return {
            ok: false,
            code: 'AUTHENTICATION_FAILED',
            message: staffInviteErrorMessage('AUTHENTICATION_FAILED'),
        };
    }

    const inviteId = input.inviteId.trim();
    if (!inviteId) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Missing invite.',
        };
    }

    try {
        const { revokeStaffInvite } = createAppServices();
        await revokeStaffInvite({
            accessToken: session.accessToken,
            inviteId,
        });
        revalidatePath('/admin/settings');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function acceptStaffInviteAction(input: { inviteId: string }): Promise<StaffInviteActionResult> {
    const session = await requireStaffSession();
    if (!session) {
        return {
            ok: false,
            code: 'AUTHENTICATION_FAILED',
            message: staffInviteErrorMessage('AUTHENTICATION_FAILED'),
        };
    }

    const inviteId = input.inviteId.trim();
    if (!inviteId) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Missing invite.',
        };
    }

    try {
        const { acceptStaffInvite, getCurrentUser } = createAppServices();
        await acceptStaffInvite({
            accessToken: session.accessToken,
            inviteId,
        });

        // Role + affiliations change server-side; refresh cookie identity.
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
            // Accept succeeded; session refresh is best-effort.
        }

        revalidatePath('/admin');
        revalidatePath('/admin/settings');
        redirect('/admin');
        return { ok: true };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return fail(error);
    }
}
