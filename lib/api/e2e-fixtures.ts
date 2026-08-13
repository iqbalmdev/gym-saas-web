/**
 * Deterministic Auth + GymOrg + StaffInvite adapters for Playwright (`GYM_SAAS_E2E_FIXTURES=1`).
 * Server Actions and RSC call these — browser `page.route` cannot intercept them.
 */
import { ApiClientError } from "@/lib/api/errors";
import type {
  Attendance,
  AttendanceReader,
  AttendanceWriter,
} from "@/lib/modules/attendance/attendance-ports";
import type { AuthGateway, AuthLane, AuthUser } from "@/lib/modules/auth/auth-ports";
import type { GymOrgsReader, GymOrgsWriter } from "@/lib/modules/gym-orgs/gym-orgs-ports";
import type { Lead, LeadsReader, LeadsWriter } from "@/lib/modules/leads/leads-ports";
import type {
  MembershipInvite,
  MembershipInvitesReader,
  MembershipInvitesWriter,
  MyDataGrants,
} from "@/lib/modules/membership-invites/membership-invites-ports";
import type {
  MembershipPlan,
  PlansReader,
  PlansWriter,
} from "@/lib/modules/plans/plans-ports";
import type {
  MembershipMutation,
  RosterMember,
  RosterReader,
  RosterWriter,
} from "@/lib/modules/roster/roster-ports";
import type {
  StaffInvite,
  StaffInvitesReader,
  StaffInvitesWriter,
} from "@/lib/modules/staff-invites/staff-invites-ports";
import type {
  RenewalDueItem,
  Subscription,
  SubscriptionsReader,
  SubscriptionsWriter,
} from "@/lib/modules/subscriptions/subscriptions-ports";

export const E2E_FIXTURES_ENV = "GYM_SAAS_E2E_FIXTURES";

export const E2E_STAFF_TOKEN_WITH_GYM = "e2e-access-token";
export const E2E_STAFF_TOKEN_NO_GYM = "e2e-access-token-no-gym";
export const E2E_CLIENT_TOKEN = "e2e-client-access";

const E2E_GYM_ID = "gym-e2e-1";
const E2E_PENDING_INBOX_ID = "invite-e2e-inbox-1";

/** Tokens that gained a gym via Accept Staff Invite in this process. */
const e2eAffiliatedTokens = new Set<string>();
/** Tokens that became gym owners via Create GymOrg in this process. */
const e2eOwnerTokens = new Set<string>();

export function areE2eFixturesEnabled(): boolean {
  return process.env[E2E_FIXTURES_ENV] === "1";
}

function isNewUserEmail(email: string): boolean {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  return local === "new" || local.startsWith("new+") || local.startsWith("new.");
}

function userFromVerify(input: {
  email: string;
  lane: AuthLane;
  name?: string;
}): AuthUser {
  const isStaff = input.lane === "STAFF";
  return {
    id: isStaff ? "e2e-user-1" : "e2e-client-1",
    email: input.email,
    name: input.name ?? (isStaff ? "E2E Admin" : "E2E Member"),
    lane: input.lane,
    roleCode: isStaff ? "STAFF_UNASSIGNED" : "CLIENT",
    staffCode: isStaff ? "STF-E2E" : null,
    emailVerifiedAt: "2026-08-05T00:00:00.000Z",
  };
}

export function createE2eAuthGateway(): AuthGateway {
  return {
    async requestOtp({ email }) {
      return {
        status: "OTP_SENT",
        isNewUser: isNewUserEmail(email),
      };
    },

    async verifyOtp({ email, lane, name }) {
      const resolvedLane: AuthLane = lane ?? "STAFF";
      const user = userFromVerify({ email, lane: resolvedLane, name });
      const accessToken =
        resolvedLane === "CLIENT"
          ? E2E_CLIENT_TOKEN
          : E2E_STAFF_TOKEN_NO_GYM;

      return {
        session: {
          accessToken,
          refreshToken: "e2e-refresh-token",
          expiresIn: 3600,
        },
        user,
      };
    },

    async completeGoogle({ accessToken, lane, name }) {
      const resolvedLane: AuthLane = lane;
      const email =
        resolvedLane === "CLIENT"
          ? "e2e-google-client@example.com"
          : "e2e-google-staff@example.com";
      const user = userFromVerify({ email, lane: resolvedLane, name });
      // Prefer explicit fixture tokens when tests pass them in the hash.
      if (
        accessToken === E2E_CLIENT_TOKEN ||
        accessToken === E2E_STAFF_TOKEN_NO_GYM ||
        accessToken === E2E_STAFF_TOKEN_WITH_GYM
      ) {
        if (accessToken === E2E_CLIENT_TOKEN) {
          return {
            user: userFromVerify({
              email: "e2e-client@example.com",
              lane: "CLIENT",
              name,
            }),
          };
        }
        if (accessToken === E2E_STAFF_TOKEN_WITH_GYM) {
          return {
            user: {
              ...userFromVerify({
                email: "e2e-admin@example.com",
                lane: "STAFF",
                name,
              }),
              roleCode: "ADMIN",
              staffCode: "STF-E2E-ADMIN",
            },
          };
        }
        return {
          user: userFromVerify({
            email: "e2e-admin@example.com",
            lane: "STAFF",
            name,
          }),
        };
      }
      return { user };
    },

    async getMe({ accessToken }) {
      if (accessToken === E2E_CLIENT_TOKEN) {
        return {
          user: userFromVerify({
            email: "e2e-client@example.com",
            lane: "CLIENT",
          }),
        };
      }
      if (accessToken === E2E_STAFF_TOKEN_WITH_GYM) {
        return {
          user: {
            ...userFromVerify({
              email: "e2e-admin@example.com",
              lane: "STAFF",
            }),
            roleCode: "ADMIN",
            staffCode: "STF-E2E-ADMIN",
          },
        };
      }
      if (e2eOwnerTokens.has(accessToken)) {
        return {
          user: {
            ...userFromVerify({
              email: "e2e-admin@example.com",
              lane: "STAFF",
            }),
            roleCode: "ADMIN",
            staffCode: "STF-E2E",
          },
        };
      }
      if (e2eAffiliatedTokens.has(accessToken)) {
        return {
          user: {
            ...userFromVerify({
              email: "e2e-admin@example.com",
              lane: "STAFF",
            }),
            roleCode: "TRAINER",
            staffCode: "STF-E2E",
          },
        };
      }
      return {
        user: userFromVerify({
          email: "e2e-admin@example.com",
          lane: "STAFF",
        }),
      };
    },
  };
}

export function createE2eGymOrgsAdapter(): GymOrgsReader & GymOrgsWriter {
  return {
    async list({ accessToken }) {
      if (accessToken === E2E_CLIENT_TOKEN) {
        return { gymOrgs: [] };
      }
      if (
        accessToken === E2E_STAFF_TOKEN_WITH_GYM ||
        e2eAffiliatedTokens.has(accessToken)
      ) {
        return {
          gymOrgs: [
            {
              id: E2E_GYM_ID,
              name: "E2E Gym",
              timezone: "Asia/Kolkata",
              isOwner: accessToken === E2E_STAFF_TOKEN_WITH_GYM,
            },
          ],
        };
      }
      return { gymOrgs: [] };
    },

    async create({ accessToken, body }) {
      e2eOwnerTokens.add(accessToken);
      e2eAffiliatedTokens.add(accessToken);
      return {
        gymOrg: {
          id: "gym-e2e-created",
          name: body.name,
          timezone: body.timezone ?? "Asia/Kolkata",
          isOwner: true,
          createdAt: "2026-08-05T00:00:00.000Z",
        },
      };
    },
  };
}

function sampleInvite(overrides: Partial<StaffInvite> = {}): StaffInvite {
  return {
    id: "invite-e2e-1",
    gymOrgId: E2E_GYM_ID,
    invitedUserId: "e2e-invitee-1",
    targetRole: "TRAINER",
    status: "PENDING",
    expiresAt: "2026-08-20T00:00:00.000Z",
    createdBy: "e2e-user-1",
    acceptedAt: null,
    createdAt: "2026-08-06T00:00:00.000Z",
    updatedAt: "2026-08-06T00:00:00.000Z",
    ...overrides,
  };
}

/** In-memory invites for E2E — reset per process (Playwright workers are isolated enough). */
const e2eGymInvites: StaffInvite[] = [
  sampleInvite({ id: "invite-e2e-gym-pending" }),
];

export function createE2eStaffInvitesAdapter(): StaffInvitesReader &
  StaffInvitesWriter {
  return {
    async listForGym({ accessToken, gymOrgId, limit = 20, offset = 0 }) {
      if (accessToken !== E2E_STAFF_TOKEN_WITH_GYM || gymOrgId !== E2E_GYM_ID) {
        return {
          staffInvites: { items: [], total: 0, limit, offset },
        };
      }
      const items = e2eGymInvites.slice(offset, offset + limit);
      return {
        staffInvites: {
          items,
          total: e2eGymInvites.length,
          limit,
          offset,
        },
      };
    },

    async listInbox({ accessToken, limit = 20, offset = 0 }) {
      if (accessToken !== E2E_STAFF_TOKEN_NO_GYM) {
        return {
          staffInvites: { items: [], total: 0, limit, offset },
        };
      }
      const items = [
        sampleInvite({
          id: E2E_PENDING_INBOX_ID,
          invitedUserId: "e2e-user-1",
          targetRole: "TRAINER",
          status: "PENDING",
          gym: {
            id: E2E_GYM_ID,
            name: "E2E Gym",
            address: null,
            contactPhone: null,
            contactEmail: null,
            logoUrl: null,
            timezone: "Asia/Kolkata",
          },
        }),
      ];
      return {
        staffInvites: {
          items: items.slice(offset, offset + limit),
          total: items.length,
          limit,
          offset,
        },
      };
    },

    async create({ accessToken, gymOrgId, body }) {
      if (accessToken !== E2E_STAFF_TOKEN_WITH_GYM) {
        throw new ApiClientError({
          code: "STAFF_INVITE_FORBIDDEN",
          message: "Not allowed",
          status: 403,
        });
      }
      const invite = sampleInvite({
        id: `invite-e2e-${e2eGymInvites.length + 1}`,
        gymOrgId,
        targetRole: body.targetRole,
        status: "PENDING",
      });
      e2eGymInvites.unshift(invite);
      return { staffInvite: invite };
    },

    async revoke({ inviteId }) {
      const idx = e2eGymInvites.findIndex((item) => item.id === inviteId);
      if (idx < 0) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      const updated: StaffInvite = {
        ...e2eGymInvites[idx],
        status: "REVOKED",
        updatedAt: "2026-08-06T01:00:00.000Z",
      };
      e2eGymInvites[idx] = updated;
      return { staffInvite: updated };
    },

    async accept({ accessToken, inviteId }) {
      if (
        accessToken === E2E_STAFF_TOKEN_NO_GYM &&
        inviteId === E2E_PENDING_INBOX_ID
      ) {
        e2eAffiliatedTokens.add(accessToken);
        return {
          staffInvite: sampleInvite({
            id: inviteId,
            invitedUserId: "e2e-user-1",
            status: "ACCEPTED",
            acceptedAt: "2026-08-06T01:00:00.000Z",
            targetRole: "TRAINER",
          }),
        };
      }
      throw new ApiClientError({
        code: "NOT_FOUND",
        message: "Not found",
        status: 404,
      });
    },
  };
}

const e2ePlans: MembershipPlan[] = [
  {
    id: "plan-e2e-base",
    gymOrgId: E2E_GYM_ID,
    name: "Monthly",
    kind: "BASE",
    capability: null,
    durationDays: 30,
    price: 999,
    active: true,
    createdAt: "2026-08-08T00:00:00.000Z",
    updatedAt: "2026-08-08T00:00:00.000Z",
  },
  {
    id: "plan-e2e-addon",
    gymOrgId: E2E_GYM_ID,
    name: "PT Coaching",
    kind: "ADDON",
    capability: "TRAINER_COACHING",
    durationDays: 30,
    price: 1500,
    active: true,
    createdAt: "2026-08-08T00:00:00.000Z",
    updatedAt: "2026-08-08T00:00:00.000Z",
  },
];

export function createE2ePlansAdapter(): PlansReader & PlansWriter {
  return {
    async list({ gymOrgId, kind, active, limit = 50, offset = 0 }) {
      if (gymOrgId !== E2E_GYM_ID) {
        return { plans: { items: [], total: 0, limit, offset } };
      }
      let items = [...e2ePlans];
      if (kind) {
        items = items.filter((plan) => plan.kind === kind);
      }
      if (active !== undefined) {
        items = items.filter((plan) => plan.active === active);
      }
      return {
        plans: {
          items: items.slice(offset, offset + limit),
          total: items.length,
          limit,
          offset,
        },
      };
    },

    async get({ planId }) {
      const plan = e2ePlans.find((item) => item.id === planId);
      if (!plan) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      return { plan };
    },

    async create({ gymOrgId, body }) {
      const plan: MembershipPlan = {
        id: `plan-e2e-${e2ePlans.length + 1}`,
        gymOrgId,
        name: body.name,
        kind: body.kind,
        capability: body.kind === "ADDON" ? "TRAINER_COACHING" : null,
        durationDays: body.durationDays,
        price: body.price,
        active: true,
        createdAt: "2026-08-08T00:00:00.000Z",
        updatedAt: "2026-08-08T00:00:00.000Z",
      };
      e2ePlans.unshift(plan);
      return { plan };
    },

    async update({ planId, body }) {
      const idx = e2ePlans.findIndex((item) => item.id === planId);
      if (idx < 0) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      const updated: MembershipPlan = {
        ...e2ePlans[idx],
        ...body,
        updatedAt: "2026-08-08T01:00:00.000Z",
      };
      e2ePlans[idx] = updated;
      return { plan: updated };
    },

    async softDelete({ planId }) {
      const idx = e2ePlans.findIndex((item) => item.id === planId);
      if (idx < 0) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      e2ePlans.splice(idx, 1);
    },
  };
}

const e2eLeads: Lead[] = [
  {
    id: "lead-e2e-1",
    gymOrgId: E2E_GYM_ID,
    name: "Walk-in Prospect",
    phone: "9876543210",
    source: "walk-in",
    interest: "trial",
    notes: null,
    status: "NEW",
    followUpDate: "2026-08-10",
    createdBy: "e2e-user-1",
    convertedMembershipInviteId: null,
    createdAt: "2026-08-08T00:00:00.000Z",
    updatedAt: "2026-08-08T00:00:00.000Z",
  },
];

export function createE2eLeadsAdapter(): LeadsReader & LeadsWriter {
  return {
    async list({ gymOrgId, status, limit = 50, offset = 0 }) {
      if (gymOrgId !== E2E_GYM_ID) {
        return { leads: { items: [], total: 0, limit, offset } };
      }
      let items = [...e2eLeads];
      if (status) {
        items = items.filter((lead) => lead.status === status);
      }
      return {
        leads: {
          items: items.slice(offset, offset + limit),
          total: items.length,
          limit,
          offset,
        },
      };
    },

    async listDueFollowUps({ gymOrgId, limit = 50, offset = 0 }) {
      if (gymOrgId !== E2E_GYM_ID) {
        return { leads: { items: [], total: 0, limit, offset } };
      }
      const items = e2eLeads.filter(
        (lead) =>
          lead.followUpDate &&
          lead.status !== "CONVERTED" &&
          lead.status !== "LOST",
      );
      return {
        leads: {
          items: items.slice(offset, offset + limit),
          total: items.length,
          limit,
          offset,
        },
      };
    },

    async get({ leadId }) {
      const lead = e2eLeads.find((item) => item.id === leadId);
      if (!lead) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      return { lead };
    },

    async create({ gymOrgId, body }) {
      const lead: Lead = {
        id: `lead-e2e-${e2eLeads.length + 1}`,
        gymOrgId,
        name: body.name,
        phone: body.phone,
        source: body.source ?? null,
        interest: body.interest ?? null,
        notes: body.notes ?? null,
        status: "NEW",
        followUpDate: null,
        createdBy: "e2e-user-1",
        convertedMembershipInviteId: null,
        createdAt: "2026-08-08T00:00:00.000Z",
        updatedAt: "2026-08-08T00:00:00.000Z",
      };
      e2eLeads.unshift(lead);
      return { lead, warnings: [] };
    },

    async update({ leadId, body }) {
      const idx = e2eLeads.findIndex((item) => item.id === leadId);
      if (idx < 0) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      const updated: Lead = {
        ...e2eLeads[idx],
        ...body,
        updatedAt: "2026-08-08T01:00:00.000Z",
      };
      e2eLeads[idx] = updated;
      return { lead: updated, warnings: [] };
    },

    async changeStatus({ leadId, status }) {
      const idx = e2eLeads.findIndex((item) => item.id === leadId);
      if (idx < 0) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      const updated: Lead = {
        ...e2eLeads[idx],
        status,
        updatedAt: "2026-08-08T01:00:00.000Z",
      };
      e2eLeads[idx] = updated;
      return { lead: updated };
    },

    async softDelete({ leadId }) {
      const idx = e2eLeads.findIndex((item) => item.id === leadId);
      if (idx < 0) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      e2eLeads.splice(idx, 1);
    },
  };
}

const e2eMembershipInvites: MembershipInvite[] = [
  {
    id: "minvite-e2e-1",
    gymOrgId: E2E_GYM_ID,
    invitedEmail: "alex.client@example.com",
    invitedUserId: "e2e-client-1",
    inviteeName: "Alex Client",
    inviteePhone: "+15551234567",
    basePlanId: "plan-e2e-base",
    basePaymentStatus: "unpaid",
    addonPlanId: null,
    addonPaymentStatus: null,
    status: "PENDING",
    expiresAt: "2026-08-22T00:00:00.000Z",
    createdBy: "e2e-user-1",
    acceptedAt: null,
    acceptedMembershipId: null,
    createdAt: "2026-08-08T12:00:00.000Z",
    updatedAt: "2026-08-08T12:00:00.000Z",
  },
];

const e2eRosterMembers: RosterMember[] = [
  {
    membershipId: "membership-e2e-active",
    clientUserId: "e2e-client-roster-1",
    gymOrgId: E2E_GYM_ID,
    status: "ACTIVE",
    checkInBlocked: false,
    assignedTrainerId: null,
    clientName: "Ada Client",
    clientEmail: "ada@example.com",
    clientPhone: null,
    joinedAt: "2026-08-08T12:00:00.000Z",
    leftAt: null,
    basePaymentStatus: "unpaid",
    baseAmountPaid: 0,
    basePriceAmount: 999,
  },
];

const e2eAttendances: Attendance[] = [];

const e2eDataGrantsByGym = new Map<string, MyDataGrants>();

function isoDateOffset(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const e2eRenewals: RenewalDueItem[] = [
  {
    id: "sub-e2e-renewal-1",
    clientMembershipId: "membership-e2e-active",
    gymOrgId: E2E_GYM_ID,
    planId: "plan-e2e-base",
    kind: "BASE",
    capability: null,
    priceAmount: 999,
    durationDays: 30,
    startDate: isoDateOffset(-28),
    endDate: isoDateOffset(1),
    startSource: "FIRST_ATTENDANCE",
    paymentStatus: "unpaid",
    amountPaid: 0,
    createdAt: "2026-08-08T12:00:00.000Z",
    updatedAt: "2026-08-11T10:00:00.000Z",
    clientUserId: "e2e-client-roster-1",
  },
];

function seedMembershipSideEffects(input: {
  membershipId: string;
  gymOrgId: string;
  invite: MembershipInvite;
  profileAttributes: string[];
  classGrants: string[];
}) {
  e2eDataGrantsByGym.set(input.gymOrgId, {
    gymOrgId: input.gymOrgId,
    clientUserId: "e2e-client-1",
    profileAttributes: input.profileAttributes,
    classGrants: input.classGrants,
  });

  const existingIdx = e2eRosterMembers.findIndex(
    (item) => item.membershipId === input.membershipId,
  );
  const member: RosterMember = {
    membershipId: input.membershipId,
    clientUserId: "e2e-client-1",
    gymOrgId: input.gymOrgId,
    status: "ACTIVE",
    checkInBlocked: false,
    assignedTrainerId: null,
    clientName: input.invite.inviteeName,
    clientEmail: input.invite.invitedEmail,
    clientPhone: input.invite.inviteePhone,
    joinedAt: "2026-08-08T12:05:00.000Z",
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

export function createE2eMembershipInvitesAdapter(): MembershipInvitesReader &
  MembershipInvitesWriter {
  return {
    async list({ gymOrgId, limit = 50, offset = 0 }) {
      if (gymOrgId !== E2E_GYM_ID) {
        return {
          membershipInvites: { items: [], total: 0, limit, offset },
        };
      }
      return {
        membershipInvites: {
          items: e2eMembershipInvites.slice(offset, offset + limit),
          total: e2eMembershipInvites.length,
          limit,
          offset,
        },
      };
    },

    async create({ gymOrgId, body }) {
      const invite: MembershipInvite = {
        id: `minvite-e2e-${e2eMembershipInvites.length + 1}`,
        gymOrgId,
        invitedEmail: body.invitedEmail,
        invitedUserId: null,
        inviteeName: body.inviteeName,
        inviteePhone: body.inviteePhone ?? null,
        basePlanId: body.basePlanId,
        basePaymentStatus: body.basePaymentStatus,
        addonPlanId: body.addonPlanId ?? null,
        addonPaymentStatus: body.addonPaymentStatus ?? null,
        status: "PENDING",
        expiresAt: body.expiresAt ?? "2026-08-22T00:00:00.000Z",
        createdBy: "e2e-user-1",
        acceptedAt: null,
        acceptedMembershipId: null,
        createdAt: "2026-08-08T12:00:00.000Z",
        updatedAt: "2026-08-08T12:00:00.000Z",
      };
      e2eMembershipInvites.unshift(invite);
      return { membershipInvite: invite };
    },

    async listInbox({ limit = 50, offset = 0 }) {
      // Ensure a pending invite exists across Playwright re-runs (same Next process).
      if (!e2eMembershipInvites.some((item) => item.status === "PENDING")) {
        e2eMembershipInvites.unshift({
          id: `minvite-e2e-pending-${Date.now()}`,
          gymOrgId: E2E_GYM_ID,
          invitedEmail: "e2e-client@example.com",
          invitedUserId: "e2e-client-1",
          inviteeName: "E2E Member",
          inviteePhone: null,
          basePlanId: "plan-e2e-base",
          basePaymentStatus: "unpaid",
          addonPlanId: null,
          addonPaymentStatus: null,
          status: "PENDING",
          expiresAt: "2026-08-22T00:00:00.000Z",
          createdBy: "e2e-user-1",
          acceptedAt: null,
          acceptedMembershipId: null,
          createdAt: "2026-08-08T12:00:00.000Z",
          updatedAt: "2026-08-08T12:00:00.000Z",
        });
      }
      // Include ACCEPTED so /client can discover gymOrgId for my-data-grants.
      const items = e2eMembershipInvites
        .filter((item) => item.status === "PENDING" || item.status === "ACCEPTED")
        .map((item) => ({
          ...item,
          gym: {
            id: E2E_GYM_ID,
            name: "E2E Gym",
            address: null,
            contactPhone: null,
            contactEmail: null,
            logoUrl: null,
            timezone: "Asia/Kolkata",
          },
        }));
      return {
        membershipInvites: {
          items: items.slice(offset, offset + limit),
          total: items.length,
          limit,
          offset,
        },
      };
    },

    async accept({ membershipInviteId, body }) {
      const idx = e2eMembershipInvites.findIndex(
        (item) => item.id === membershipInviteId,
      );
      if (idx < 0) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      if (e2eMembershipInvites[idx].status !== "PENDING") {
        throw new ApiClientError({
          code: "MEMBERSHIP_INVITE_INVALID_TRANSITION",
          message: "Only PENDING membership invites can be accepted",
          status: 409,
        });
      }
      const membershipId = "membership-e2e-1";
      const profileAttributes = [
        "DOB",
        "HEIGHT",
        "WEIGHT",
        ...(body?.optionalProfileAttributes ?? []),
      ];
      const classGrants = [...(body?.optionalClassGrants ?? [])];
      const updated: MembershipInvite = {
        ...e2eMembershipInvites[idx],
        status: "ACCEPTED",
        acceptedAt: "2026-08-08T12:05:00.000Z",
        acceptedMembershipId: membershipId,
        updatedAt: "2026-08-08T12:05:00.000Z",
      };
      e2eMembershipInvites[idx] = updated;
      seedMembershipSideEffects({
        membershipId,
        gymOrgId: updated.gymOrgId,
        invite: updated,
        profileAttributes,
        classGrants,
      });
      return {
        membershipInvite: updated,
        membershipId,
        grants: {
          profileAttributes,
          classGrants,
        },
      };
    },

    async revoke({ membershipInviteId }) {
      const idx = e2eMembershipInvites.findIndex(
        (item) => item.id === membershipInviteId,
      );
      if (idx < 0) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      if (e2eMembershipInvites[idx].status !== "PENDING") {
        throw new ApiClientError({
          code: "MEMBERSHIP_INVITE_INVALID_TRANSITION",
          message: "Only PENDING membership invites can be revoked",
          status: 409,
        });
      }
      const updated: MembershipInvite = {
        ...e2eMembershipInvites[idx],
        status: "REVOKED",
        updatedAt: "2026-08-08T12:10:00.000Z",
      };
      e2eMembershipInvites[idx] = updated;
      return { membershipInvite: updated };
    },

    async getMyDataGrants({ gymOrgId }) {
      const grants = e2eDataGrantsByGym.get(gymOrgId);
      if (!grants) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Active membership not found for this gym",
          status: 404,
        });
      }
      return { dataGrants: { ...grants } };
    },

    async updateMyDataGrants({ gymOrgId, body }) {
      const existing = e2eDataGrantsByGym.get(gymOrgId);
      if (!existing) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Active membership not found for this gym",
          status: 404,
        });
      }
      const updated: MyDataGrants = {
        ...existing,
        profileAttributes: [
          "DOB",
          "HEIGHT",
          "WEIGHT",
          ...(body.optionalProfileAttributes ?? []),
        ],
        classGrants: [...(body.optionalClassGrants ?? [])],
      };
      e2eDataGrantsByGym.set(gymOrgId, updated);
      return { dataGrants: updated };
    },
  };
}

function toMembershipMutation(member: RosterMember): MembershipMutation {
  return {
    membershipId: member.membershipId,
    clientUserId: member.clientUserId,
    gymOrgId: member.gymOrgId,
    status: member.status,
    checkInBlocked: member.checkInBlocked,
    assignedTrainerId: member.assignedTrainerId,
    joinedAt: member.joinedAt,
    leftAt: member.leftAt,
    updatedAt: "2026-08-11T12:00:00.000Z",
  };
}

export function createE2eRosterAdapter(): RosterReader & RosterWriter {
  return {
    async listMembers({ gymOrgId, status, q }) {
      if (gymOrgId !== E2E_GYM_ID) {
        return { members: [] };
      }
      let items = [...e2eRosterMembers];
      if (status) {
        items = items.filter((member) => member.status === status);
      }
      if (q?.trim()) {
        const needle = q.trim().toLowerCase();
        items = items.filter(
          (member) =>
            member.clientName.toLowerCase().includes(needle) ||
            member.clientEmail.toLowerCase().includes(needle) ||
            (member.clientPhone ?? "").toLowerCase().includes(needle),
        );
      }
      return { members: items };
    },

    async offboard({ gymOrgId, membershipId }) {
      const idx = e2eRosterMembers.findIndex(
        (item) =>
          item.membershipId === membershipId && item.gymOrgId === gymOrgId,
      );
      if (idx < 0 || e2eRosterMembers[idx].status !== "ACTIVE") {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Active membership not found",
          status: 404,
        });
      }
      const updated: RosterMember = {
        ...e2eRosterMembers[idx],
        status: "INACTIVE",
        leftAt: "2026-08-11T12:00:00.000Z",
      };
      e2eRosterMembers[idx] = updated;
      e2eDataGrantsByGym.delete(gymOrgId);
      return { membership: toMembershipMutation(updated) };
    },

    async setCheckInBlock({ gymOrgId, membershipId, blocked }) {
      const idx = e2eRosterMembers.findIndex(
        (item) =>
          item.membershipId === membershipId && item.gymOrgId === gymOrgId,
      );
      if (idx < 0) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Active membership not found",
          status: 404,
        });
      }
      if (e2eRosterMembers[idx].status !== "ACTIVE") {
        throw new ApiClientError({
          code: "CLIENT_MEMBERSHIP_INVALID_TRANSITION",
          message: "Cannot block check-in an inactive membership",
          status: 422,
        });
      }
      const updated: RosterMember = {
        ...e2eRosterMembers[idx],
        checkInBlocked: blocked,
      };
      e2eRosterMembers[idx] = updated;
      return { membership: toMembershipMutation(updated) };
    },
  };
}

export function createE2eAttendanceAdapter(): AttendanceReader &
  AttendanceWriter {
  return {
    async listForDay({ gymOrgId, day, limit = 50, offset = 0 }) {
      if (gymOrgId !== E2E_GYM_ID) {
        return {
          attendances: { items: [], total: 0, limit, offset },
        };
      }
      const items = e2eAttendances.filter(
        (item) =>
          item.gymOrgId === gymOrgId && item.occurredAt.startsWith(day),
      );
      return {
        attendances: {
          items: items.slice(offset, offset + limit),
          total: items.length,
          limit,
          offset,
        },
      };
    },

    async deskMark({ gymOrgId, clientUserId }) {
      const member = e2eRosterMembers.find(
        (item) =>
          item.gymOrgId === gymOrgId &&
          item.clientUserId === clientUserId &&
          item.status === "ACTIVE",
      );
      if (!member) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Active membership not found",
          status: 404,
        });
      }
      if (member.checkInBlocked) {
        throw new ApiClientError({
          code: "ATTENDANCE_FORBIDDEN",
          message: "Check-in is blocked for this member",
          status: 403,
        });
      }
      const day = new Date().toISOString().slice(0, 10);
      const attendance: Attendance = {
        id: `attendance-e2e-${e2eAttendances.length + 1}`,
        clientUserId,
        gymOrgId,
        occurredAt: `${day}T10:00:00.000Z`,
        recordedBy: "ADMIN",
        recorderUserId: "e2e-user-1",
        createdAt: `${day}T10:00:00.000Z`,
        baseStarted: false,
      };
      e2eAttendances.unshift(attendance);
      return { attendance };
    },
  };
}

export function createE2eSubscriptionsAdapter(): SubscriptionsReader &
  SubscriptionsWriter {
  return {
    async listRenewalsDue({
      gymOrgId,
      onOrBefore,
      onOrAfter,
      limit = 50,
      offset = 0,
    }) {
      if (gymOrgId !== E2E_GYM_ID) {
        return {
          renewals: { items: [], total: 0, limit, offset },
        };
      }
      let items = e2eRenewals.filter((item) => item.gymOrgId === gymOrgId);
      if (onOrAfter) {
        items = items.filter(
          (item) => item.endDate && item.endDate >= onOrAfter,
        );
      }
      if (onOrBefore) {
        items = items.filter(
          (item) => item.endDate && item.endDate <= onOrBefore,
        );
      }
      return {
        renewals: {
          items: items.slice(offset, offset + limit),
          total: items.length,
          limit,
          offset,
        },
      };
    },

    async updatePayment({ gymOrgId, subscriptionId, body }) {
      const idx = e2eRenewals.findIndex(
        (item) => item.id === subscriptionId && item.gymOrgId === gymOrgId,
      );
      if (idx < 0) {
        throw new ApiClientError({
          code: "NOT_FOUND",
          message: "Not found",
          status: 404,
        });
      }
      if (
        body.paymentStatus === "partial" &&
        body.amountPaid === undefined
      ) {
        throw new ApiClientError({
          code: "VALIDATION_ERROR",
          message: "Partial payment requires amountPaid",
          status: 422,
        });
      }
      const updated: RenewalDueItem = {
        ...e2eRenewals[idx],
        paymentStatus: body.paymentStatus,
        amountPaid:
          body.amountPaid ??
          (body.paymentStatus === "paid" ? e2eRenewals[idx].priceAmount : 0),
        updatedAt: "2026-08-11T11:00:00.000Z",
      };
      e2eRenewals[idx] = updated;
      const subscription: Subscription = { ...updated };
      return { subscription };
    },
  };
}
