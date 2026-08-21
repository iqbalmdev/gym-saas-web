/**
 * Shared state + constants for the Playwright fixture adapters
 * (`GYM_SAAS_E2E_FIXTURES=1`). Per-module fakes live in
 * `modules/<m>/<m>-e2e-fixtures.ts` and read/write the containers here.
 *
 * This state is genuinely cross-module — accepting a membership invite creates
 * a roster member, a subscription and a DataGrant — which is why it stays in
 * one kernel rather than being cut up per module (ADR-0007 called this out;
 * ADR-0011 forced the `globalThis` backing, see below).
 */
import type { Attendance } from '@/modules/attendance/attendance-ports';
import type { GymTrainer } from '@/modules/gym-orgs/gym-orgs-ports';
import type { Lead } from '@/modules/leads/leads-ports';
import type { MembershipInvite, MyDataGrants } from '@/modules/membership-invites/membership-invites-ports';
import type { MembershipPlan } from '@/modules/plans/plans-ports';
import type { ClientProfile, ProgressLog } from '@/modules/profile/profile-ports';
import type { RosterMember } from '@/modules/roster/roster-ports';
import type { StaffInvite } from '@/modules/staff-invites/staff-invites-ports';
import type { RenewalDueItem } from '@/modules/subscriptions/subscriptions-ports';

export const E2E_FIXTURES_ENV = 'GYM_SAAS_E2E_FIXTURES';

export const E2E_STAFF_TOKEN_WITH_GYM = 'e2e-access-token';
export const E2E_STAFF_TOKEN_NO_GYM = 'e2e-access-token-no-gym';
export const E2E_CLIENT_TOKEN = 'e2e-client-access';

export const E2E_GYM_ID = 'gym-e2e-1';
export const E2E_PENDING_INBOX_ID = 'invite-e2e-inbox-1';
export const E2E_TRAINER_PROFILE_ID = 'trainer-profile-e2e-1';

/**
 * Process-wide store for the mutable fixture state below.
 *
 * Next bundles route handlers (`app/api/**`) separately from page and Server
 * Action code, so this module is instantiated **more than once per server**.
 * With plain `const` module state, a write through a Server Action landed in
 * one copy while a read through a route handler saw another — the fixture
 * equivalent of two databases. Keying off `globalThis` gives every bundle the
 * same objects, because the process is what's actually shared.
 *
 * Only fixtures need this: in production `createAppServices()` holds no state,
 * it just talks HTTP to the Gym Backend.
 */
const e2eGlobal = globalThis as typeof globalThis & {
    __gymSaasE2eStore?: Map<string, unknown>;
};

export function e2eShared<T>(key: string, create: () => T): T {
    const store = (e2eGlobal.__gymSaasE2eStore ??= new Map<string, unknown>());
    if (!store.has(key)) {
        store.set(key, create());
    }
    return store.get(key) as T;
}

/** Tokens that gained a gym via Accept Staff Invite in this process. */
export const e2eAffiliatedTokens = e2eShared('affiliatedTokens', () => new Set<string>());
/** Tokens that became gym owners via Create GymOrg in this process. */
export const e2eOwnerTokens = e2eShared('ownerTokens', () => new Set<string>());

export function areE2eFixturesEnabled(): boolean {
    return process.env[E2E_FIXTURES_ENV] === '1';
}

export function sampleInvite(overrides: Partial<StaffInvite> = {}): StaffInvite {
    return {
        id: 'invite-e2e-1',
        gymOrgId: E2E_GYM_ID,
        invitedUserId: 'e2e-invitee-1',
        targetRole: 'TRAINER',
        status: 'PENDING',
        expiresAt: '2026-08-20T00:00:00.000Z',
        createdBy: 'e2e-user-1',
        acceptedAt: null,
        createdAt: '2026-08-06T00:00:00.000Z',
        updatedAt: '2026-08-06T00:00:00.000Z',
        ...overrides,
    };
}

/** In-memory invites for E2E — reset per process (Playwright workers are isolated enough). */
export const e2eGymInvites = e2eShared('gymInvites', (): StaffInvite[] => [
    sampleInvite({ id: 'invite-e2e-gym-pending' }),
]);

export const e2ePlans = e2eShared('plans', (): MembershipPlan[] => [
    {
        id: 'plan-e2e-base',
        gymOrgId: E2E_GYM_ID,
        name: 'Monthly',
        kind: 'BASE',
        capability: null,
        durationDays: 30,
        price: 999,
        active: true,
        createdAt: '2026-08-08T00:00:00.000Z',
        updatedAt: '2026-08-08T00:00:00.000Z',
    },
    {
        id: 'plan-e2e-addon',
        gymOrgId: E2E_GYM_ID,
        name: 'PT Coaching',
        kind: 'ADDON',
        capability: 'TRAINER_COACHING',
        durationDays: 30,
        price: 1500,
        active: true,
        createdAt: '2026-08-08T00:00:00.000Z',
        updatedAt: '2026-08-08T00:00:00.000Z',
    },
]);

export const e2eLeads = e2eShared('leads', (): Lead[] => [
    {
        id: 'lead-e2e-1',
        gymOrgId: E2E_GYM_ID,
        name: 'Walk-in Prospect',
        phone: '9876543210',
        source: 'walk-in',
        interest: 'trial',
        notes: null,
        status: 'NEW',
        followUpDate: '2026-08-10',
        createdBy: 'e2e-user-1',
        convertedMembershipInviteId: null,
        createdAt: '2026-08-08T00:00:00.000Z',
        updatedAt: '2026-08-08T00:00:00.000Z',
    },
]);

export const e2eMembershipInvites = e2eShared('membershipInvites', (): MembershipInvite[] => [
    {
        id: 'minvite-e2e-1',
        gymOrgId: E2E_GYM_ID,
        invitedEmail: 'alex.client@example.com',
        invitedUserId: 'e2e-client-1',
        inviteeName: 'Alex Client',
        inviteePhone: '+15551234567',
        basePlanId: 'plan-e2e-base',
        basePaymentStatus: 'unpaid',
        addonPlanId: null,
        addonPaymentStatus: null,
        status: 'PENDING',
        expiresAt: '2026-08-22T00:00:00.000Z',
        createdBy: 'e2e-user-1',
        acceptedAt: null,
        acceptedMembershipId: null,
        createdAt: '2026-08-08T12:00:00.000Z',
        updatedAt: '2026-08-08T12:00:00.000Z',
    },
]);

export const e2eGymTrainers = e2eShared('gymTrainers', (): GymTrainer[] => [
    {
        trainerProfileId: E2E_TRAINER_PROFILE_ID,
        userId: 'e2e-user-1',
        gymOrgId: E2E_GYM_ID,
        name: 'Owner Admin',
        email: 'owner@example.com',
        staffCode: 'STAFF-AB12',
        bio: null,
        isAdmin: true,
        createdAt: '2026-08-08T12:00:00.000Z',
    },
]);

export const e2eRosterMembers = e2eShared('rosterMembers', (): RosterMember[] => [
    {
        membershipId: 'membership-e2e-active',
        clientUserId: 'e2e-client-roster-1',
        gymOrgId: E2E_GYM_ID,
        status: 'ACTIVE',
        checkInBlocked: false,
        assignedTrainerId: null,
        clientName: 'Ada Client',
        clientEmail: 'ada@example.com',
        clientPhone: null,
        joinedAt: '2026-08-08T12:00:00.000Z',
        leftAt: null,
        basePaymentStatus: 'unpaid',
        baseAmountPaid: 0,
        basePriceAmount: 999,
    },
]);

export const e2eClientProfiles = e2eShared('clientProfiles', () => {
    const profiles = new Map<string, ClientProfile>();
    profiles.set('e2e-client-1', {
        userId: 'e2e-client-1',
        heightCm: 170,
        weightKg: 68,
        dob: '1990-01-15',
        gender: 'MALE',
        medicalNotes: null,
        bmi: 23.5,
        createdAt: '2026-08-02T12:00:00.000Z',
        updatedAt: '2026-08-11T10:05:00.000Z',
    });
    profiles.set('e2e-client-roster-1', {
        userId: 'e2e-client-roster-1',
        heightCm: 165,
        weightKg: 60,
        dob: '1992-04-20',
        gender: 'FEMALE',
        medicalNotes: 'Old ankle sprain',
        bmi: 22,
        createdAt: '2026-08-08T12:00:00.000Z',
        updatedAt: '2026-08-11T10:05:00.000Z',
    });
    return profiles;
});

export const e2eProgressLogs = e2eShared('progressLogs', (): ProgressLog[] => [
    {
        id: 'progress-e2e-ada-1',
        clientUserId: 'e2e-client-roster-1',
        logDate: '2026-08-11',
        weightKg: 60,
        bmi: 22,
        notes: null,
        createdAt: '2026-08-11T10:05:00.000Z',
    },
]);

/** Staff-visible grants per gym+client. Ada shares required vitals only — not PROGRESS. */
export const e2eStaffClientGrants = e2eShared(
    'staffClientGrants',
    () =>
        new Map<string, { profileAttributes: string[]; classGrants: string[] }>([
            [`${E2E_GYM_ID}:e2e-client-roster-1`, { profileAttributes: ['DOB', 'HEIGHT', 'WEIGHT'], classGrants: [] }],
        ]),
);

export const e2eAttendances = e2eShared('attendances', (): Attendance[] => []);
export const e2eDataGrantsByGym = e2eShared('dataGrantsByGym', () => new Map<string, MyDataGrants>());

export function isoDateOffset(days: number): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

export const e2eRenewals = e2eShared('renewals', (): RenewalDueItem[] => [
    {
        id: 'sub-e2e-renewal-1',
        clientMembershipId: 'membership-e2e-active',
        gymOrgId: E2E_GYM_ID,
        planId: 'plan-e2e-base',
        kind: 'BASE',
        capability: null,
        priceAmount: 999,
        durationDays: 30,
        startDate: isoDateOffset(-28),
        endDate: isoDateOffset(1),
        startSource: 'FIRST_ATTENDANCE',
        paymentStatus: 'unpaid',
        amountPaid: 0,
        createdAt: '2026-08-08T12:00:00.000Z',
        updatedAt: '2026-08-11T10:00:00.000Z',
        clientUserId: 'e2e-client-roster-1',
    },
]);

/** Accepting a membership invite fans out across roster, subscriptions and DataGrants. */
export function seedMembershipSideEffects(input: {
    membershipId: string;
    gymOrgId: string;
    invite: MembershipInvite;
    profileAttributes: string[];
    classGrants: string[];
}) {
    e2eDataGrantsByGym.set(input.gymOrgId, {
        gymOrgId: input.gymOrgId,
        clientUserId: 'e2e-client-1',
        profileAttributes: input.profileAttributes,
        classGrants: input.classGrants,
    });
    e2eStaffClientGrants.set(`${input.gymOrgId}:e2e-client-1`, {
        profileAttributes: input.profileAttributes,
        classGrants: input.classGrants,
    });

    const existingIdx = e2eRosterMembers.findIndex((item) => item.membershipId === input.membershipId);
    const member: RosterMember = {
        membershipId: input.membershipId,
        clientUserId: 'e2e-client-1',
        gymOrgId: input.gymOrgId,
        status: 'ACTIVE',
        checkInBlocked: false,
        assignedTrainerId: null,
        clientName: input.invite.inviteeName,
        clientEmail: input.invite.invitedEmail,
        clientPhone: input.invite.inviteePhone,
        joinedAt: '2026-08-08T12:05:00.000Z',
        leftAt: null,
        basePaymentStatus: input.invite.basePaymentStatus,
        baseAmountPaid: 0,
        basePriceAmount: 999,
    };
    if (existingIdx >= 0) {
        e2eRosterMembers[existingIdx] = member;
    } else {
        e2eRosterMembers.unshift(member);
    }
}
