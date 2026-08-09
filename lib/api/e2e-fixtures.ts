/**
 * Deterministic Auth + GymOrg + StaffInvite adapters for Playwright (`GYM_SAAS_E2E_FIXTURES=1`).
 * Server Actions and RSC call these — browser `page.route` cannot intercept them.
 */
import { ApiClientError } from "@/lib/api/errors";
import type { AuthGateway, AuthLane, AuthUser } from "@/lib/ports/auth";
import type { GymOrgsReader, GymOrgsWriter } from "@/lib/ports/gym-orgs";
import type { Lead, LeadsReader, LeadsWriter } from "@/lib/ports/leads";
import type {
  MembershipPlan,
  PlansReader,
  PlansWriter,
} from "@/lib/ports/plans";
import type {
  StaffInvite,
  StaffInvitesReader,
  StaffInvitesWriter,
} from "@/lib/ports/staff-invites";

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
