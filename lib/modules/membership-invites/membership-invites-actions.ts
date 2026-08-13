'use server';

import { revalidatePath } from 'next/cache';

import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { getSession } from '@/lib/auth/session';
import { membershipInviteErrorMessage } from '@/lib/modules/membership-invites/membership-invites-errors';
import type {
    OptionalClassGrant,
    OptionalProfileAttribute,
    MembershipPaymentStatus,
} from '@/lib/modules/membership-invites/membership-invites-ports';

export type MembershipInviteActionResult =
    { ok: true; gymOrgId?: string } | { ok: false; code: string; message: string };

function fail(error: unknown): MembershipInviteActionResult {
    if (error instanceof ApiClientError) {
        return {
            ok: false,
            code: error.code,
            message: membershipInviteErrorMessage(error.code, error.message),
        };
    }
    if (error instanceof Error && error.name === 'ZodError') {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: membershipInviteErrorMessage('VALIDATION_ERROR'),
        };
    }
    return {
        ok: false,
        code: 'NETWORK_OR_UNKNOWN',
        message: membershipInviteErrorMessage('NETWORK_OR_UNKNOWN'),
    };
}

async function requireStaffAdminGym(): Promise<
    { ok: true; accessToken: string; gymOrgId: string } | { ok: false; result: MembershipInviteActionResult }
> {
    const session = await getSession();
    if (!session || session.lane !== 'STAFF') {
        return {
            ok: false,
            result: {
                ok: false,
                code: 'AUTHENTICATION_FAILED',
                message: membershipInviteErrorMessage('AUTHENTICATION_FAILED'),
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
                message: membershipInviteErrorMessage('FORBIDDEN'),
            },
        };
    }
    return { ok: true, accessToken: session.accessToken, gymOrgId };
}

function isPaymentStatus(value: string): value is MembershipPaymentStatus {
    return value === 'paid' || value === 'unpaid' || value === 'partial';
}

export async function createMembershipInviteAction(input: {
    inviteeName: string;
    invitedEmail: string;
    inviteePhone?: string;
    basePlanId: string;
    basePaymentStatus: string;
    addonPlanId?: string;
    addonPaymentStatus?: string;
}): Promise<MembershipInviteActionResult> {
    const gate = await requireStaffAdminGym();
    if (!gate.ok) {
        return gate.result;
    }

    const inviteeName = input.inviteeName.trim();
    const invitedEmail = input.invitedEmail.trim().toLowerCase();
    const inviteePhone = input.inviteePhone?.trim() ?? '';
    const basePlanId = input.basePlanId.trim();
    const addonPlanId = input.addonPlanId?.trim() ?? '';
    const addonPaymentRaw = input.addonPaymentStatus?.trim() ?? '';

    if (inviteeName.length < 1) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Enter the invitee name.',
        };
    }
    if (!invitedEmail.includes('@')) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Enter a valid client email.',
        };
    }
    if (!basePlanId) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Choose a Base plan.',
        };
    }
    if (!isPaymentStatus(input.basePaymentStatus)) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Choose a base payment status.',
        };
    }
    const hasAddon = Boolean(addonPlanId) || Boolean(addonPaymentRaw);
    if (hasAddon) {
        if (!addonPlanId || !isPaymentStatus(addonPaymentRaw)) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                message: 'Add-on plan and payment status must both be set, or both left empty.',
            };
        }
    }

    try {
        const { createMembershipInvite } = createAppServices();
        await createMembershipInvite({
            accessToken: gate.accessToken,
            gymOrgId: gate.gymOrgId,
            body: {
                inviteeName,
                invitedEmail,
                basePlanId,
                basePaymentStatus: input.basePaymentStatus,
                ...(inviteePhone ? { inviteePhone } : {}),
                ...(hasAddon
                    ? {
                          addonPlanId,
                          addonPaymentStatus: addonPaymentRaw as MembershipPaymentStatus,
                      }
                    : {}),
            },
        });
        revalidatePath('/admin/members');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

export async function revokeMembershipInviteAction(input: {
    membershipInviteId: string;
}): Promise<MembershipInviteActionResult> {
    const gate = await requireStaffAdminGym();
    if (!gate.ok) {
        return gate.result;
    }
    const membershipInviteId = input.membershipInviteId.trim();
    if (!membershipInviteId) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: membershipInviteErrorMessage('VALIDATION_ERROR'),
        };
    }
    try {
        const { revokeMembershipInvite } = createAppServices();
        await revokeMembershipInvite({
            accessToken: gate.accessToken,
            gymOrgId: gate.gymOrgId,
            membershipInviteId,
        });
        revalidatePath('/admin/members');
        return { ok: true };
    } catch (error) {
        return fail(error);
    }
}

const PROFILE_ATTRS = new Set<OptionalProfileAttribute>(['GENDER', 'MEDICAL_NOTES']);
const CLASS_GRANTS = new Set<OptionalClassGrant>(['PROGRESS', 'CALORIES', 'WEARABLES', 'DIET_PLANS', 'WORKOUT_PLANS']);

export async function acceptMembershipInviteAction(input: {
    membershipInviteId: string;
    optionalProfileAttributes?: string[];
    optionalClassGrants?: string[];
}): Promise<MembershipInviteActionResult> {
    const session = await getSession();
    if (!session || session.lane !== 'CLIENT') {
        return {
            ok: false,
            code: 'MEMBERSHIP_INVITE_FORBIDDEN',
            message: membershipInviteErrorMessage('MEMBERSHIP_INVITE_FORBIDDEN'),
        };
    }

    const membershipInviteId = input.membershipInviteId.trim();
    if (!membershipInviteId) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: membershipInviteErrorMessage('VALIDATION_ERROR'),
        };
    }

    const optionalProfileAttributes = (input.optionalProfileAttributes ?? []).filter(
        (value): value is OptionalProfileAttribute => PROFILE_ATTRS.has(value as OptionalProfileAttribute),
    );
    const optionalClassGrants = (input.optionalClassGrants ?? []).filter((value): value is OptionalClassGrant =>
        CLASS_GRANTS.has(value as OptionalClassGrant),
    );

    try {
        const { acceptMembershipInvite } = createAppServices();
        const result = await acceptMembershipInvite({
            accessToken: session.accessToken,
            membershipInviteId,
            body: {
                optionalProfileAttributes,
                optionalClassGrants,
            },
        });
        revalidatePath('/client');
        return { ok: true, gymOrgId: result.membershipInvite.gymOrgId };
    } catch (error) {
        return fail(error);
    }
}

export async function updateMyDataGrantsAction(input: {
    gymOrgId: string;
    optionalProfileAttributes?: string[];
    optionalClassGrants?: string[];
}): Promise<MembershipInviteActionResult> {
    const session = await getSession();
    if (!session || session.lane !== 'CLIENT') {
        return {
            ok: false,
            code: 'DATA_GRANT_FORBIDDEN',
            message: membershipInviteErrorMessage('DATA_GRANT_FORBIDDEN'),
        };
    }

    const gymOrgId = input.gymOrgId.trim();
    if (!gymOrgId) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: membershipInviteErrorMessage('VALIDATION_ERROR'),
        };
    }

    const optionalProfileAttributes = (input.optionalProfileAttributes ?? []).filter(
        (value): value is OptionalProfileAttribute => PROFILE_ATTRS.has(value as OptionalProfileAttribute),
    );
    const optionalClassGrants = (input.optionalClassGrants ?? []).filter((value): value is OptionalClassGrant =>
        CLASS_GRANTS.has(value as OptionalClassGrant),
    );

    try {
        const { updateMyDataGrants } = createAppServices();
        await updateMyDataGrants({
            accessToken: session.accessToken,
            gymOrgId,
            body: {
                optionalProfileAttributes,
                optionalClassGrants,
            },
        });
        revalidatePath('/client');
        return { ok: true, gymOrgId };
    } catch (error) {
        return fail(error);
    }
}
