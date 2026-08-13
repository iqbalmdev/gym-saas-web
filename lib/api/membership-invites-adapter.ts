import { z } from "zod";

import { endpoints } from "@/lib/api/endpoints";
import type { HttpClient } from "@/lib/api/client";
import type {
  AcceptMembershipInviteInput,
  CreateMembershipInviteInput,
  MembershipInvite,
  MembershipInvitesReader,
  MembershipInvitesWriter,
  MembershipPaymentStatus,
  MyDataGrants,
  UpdateMyDataGrantsInput,
} from "@/lib/ports/membership-invites";

const paymentStatusSchema = z.enum(["paid", "unpaid", "partial"]);

const inviteGymSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().nullable(),
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  logoUrl: z.string().nullable(),
  timezone: z.string().min(1),
});

const inviteSchema = z.object({
  id: z.string().min(1),
  gymOrgId: z.string().min(1).optional(),
  gym: inviteGymSchema.optional(),
  invitedEmail: z.string().min(1),
  invitedUserId: z.string().min(1).nullable().optional(),
  inviteeName: z.string().min(1),
  inviteePhone: z.string().min(1).nullable().optional(),
  basePlanId: z.string().min(1),
  basePaymentStatus: paymentStatusSchema,
  addonPlanId: z.string().min(1).nullable().optional(),
  addonPaymentStatus: paymentStatusSchema.nullable().optional(),
  status: z.enum(["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"]),
  expiresAt: z.string().min(1),
  createdBy: z.string().min(1).optional(),
  acceptedAt: z.string().min(1).nullable().optional(),
  acceptedMembershipId: z.string().min(1).nullable().optional(),
  createdAt: z.string().min(1).optional(),
  updatedAt: z.string().min(1).optional(),
});

function normalizeInvite(
  raw: z.infer<typeof inviteSchema>,
  gymOrgId: string,
): MembershipInvite {
  return {
    id: raw.id,
    gymOrgId: raw.gymOrgId ?? gymOrgId,
    ...(raw.gym ? { gym: raw.gym } : {}),
    invitedEmail: raw.invitedEmail,
    invitedUserId: raw.invitedUserId ?? null,
    inviteeName: raw.inviteeName,
    inviteePhone: raw.inviteePhone ?? null,
    basePlanId: raw.basePlanId,
    basePaymentStatus: raw.basePaymentStatus,
    addonPlanId: raw.addonPlanId ?? null,
    addonPaymentStatus: raw.addonPaymentStatus ?? null,
    status: raw.status,
    expiresAt: raw.expiresAt,
    createdBy: raw.createdBy ?? "",
    acceptedAt: raw.acceptedAt ?? null,
    acceptedMembershipId: raw.acceptedMembershipId ?? null,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

const inviteEnvelopeSchema = z.object({
  membershipInvite: inviteSchema,
});

const acceptEnvelopeSchema = z.object({
  membershipInvite: inviteSchema,
  membershipId: z.string().min(1),
  grants: z.object({
    profileAttributes: z.array(z.string()),
    classGrants: z.array(z.string()),
  }),
});

const pageSchema = z.object({
  membershipInvites: z.object({
    items: z.array(inviteSchema),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  }),
});

const dataGrantsSchema = z.object({
  gymOrgId: z.string().min(1),
  clientUserId: z.string().min(1),
  profileAttributes: z.array(z.string()),
  classGrants: z.array(z.string()),
});

const dataGrantsEnvelopeSchema = z.object({
  dataGrants: dataGrantsSchema,
});

function normalizeDataGrants(
  raw: z.infer<typeof dataGrantsSchema>,
): MyDataGrants {
  return {
    gymOrgId: raw.gymOrgId,
    clientUserId: raw.clientUserId,
    profileAttributes: raw.profileAttributes,
    classGrants: raw.classGrants,
  };
}

function listQuery(input: { limit?: number; offset?: number }): string {
  const params = new URLSearchParams();
  params.set("limit", String(input.limit ?? 50));
  params.set("offset", String(input.offset ?? 0));
  return params.toString();
}

export function createMembershipInvitesAdapter(
  http: HttpClient,
): MembershipInvitesReader & MembershipInvitesWriter {
  return {
    async listInbox({ accessToken, limit, offset }) {
      const raw = await http.request<unknown>({
        path: `${endpoints.membershipInviteInbox}?${listQuery({ limit, offset })}`,
        method: "GET",
        accessToken,
      });
      const parsed = pageSchema.parse(raw);
      return {
        membershipInvites: {
          ...parsed.membershipInvites,
          items: parsed.membershipInvites.items.map((item) =>
            normalizeInvite(item, item.gymOrgId ?? item.gym?.id ?? ""),
          ),
        },
      };
    },

    async list({ accessToken, gymOrgId, limit, offset }) {
      const raw = await http.request<unknown>({
        path: `${endpoints.gymOrgMembershipInvites(gymOrgId)}?${listQuery({ limit, offset })}`,
        method: "GET",
        accessToken,
      });
      const parsed = pageSchema.parse(raw);
      return {
        membershipInvites: {
          ...parsed.membershipInvites,
          items: parsed.membershipInvites.items.map((item) =>
            normalizeInvite(item, gymOrgId),
          ),
        },
      };
    },

    async create({ accessToken, gymOrgId, body }) {
      const payload: CreateMembershipInviteInput = {
        inviteeName: body.inviteeName,
        invitedEmail: body.invitedEmail,
        basePlanId: body.basePlanId,
        basePaymentStatus: body.basePaymentStatus,
      };
      if (body.inviteePhone) {
        payload.inviteePhone = body.inviteePhone;
      }
      if (body.addonPlanId && body.addonPaymentStatus) {
        payload.addonPlanId = body.addonPlanId;
        payload.addonPaymentStatus = body.addonPaymentStatus;
      }
      if (body.expiresAt) {
        payload.expiresAt = body.expiresAt;
      }
      const raw = await http.request<unknown>({
        path: endpoints.gymOrgMembershipInvites(gymOrgId),
        method: "POST",
        accessToken,
        body: payload,
      });
      const parsed = inviteEnvelopeSchema.parse(raw);
      return {
        membershipInvite: normalizeInvite(parsed.membershipInvite, gymOrgId),
      };
    },

    async accept({ accessToken, membershipInviteId, body }) {
      const payload: AcceptMembershipInviteInput = {};
      if (body?.optionalProfileAttributes?.length) {
        payload.optionalProfileAttributes = body.optionalProfileAttributes;
      }
      if (body?.optionalClassGrants?.length) {
        payload.optionalClassGrants = body.optionalClassGrants;
      }
      const raw = await http.request<unknown>({
        path: endpoints.membershipInviteAccept(membershipInviteId),
        method: "POST",
        accessToken,
        body: payload,
      });
      const parsed = acceptEnvelopeSchema.parse(raw);
      return {
        membershipInvite: normalizeInvite(
          parsed.membershipInvite,
          parsed.membershipInvite.gymOrgId ?? "",
        ),
        membershipId: parsed.membershipId,
        grants: parsed.grants,
      };
    },

    async revoke({ accessToken, gymOrgId, membershipInviteId }) {
      const raw = await http.request<unknown>({
        path: endpoints.gymOrgMembershipInviteRevoke(
          gymOrgId,
          membershipInviteId,
        ),
        method: "POST",
        accessToken,
      });
      const parsed = inviteEnvelopeSchema.parse(raw);
      return {
        membershipInvite: normalizeInvite(parsed.membershipInvite, gymOrgId),
      };
    },

    async getMyDataGrants({ accessToken, gymOrgId }) {
      const raw = await http.request<unknown>({
        path: endpoints.gymOrgMyDataGrants(gymOrgId),
        method: "GET",
        accessToken,
      });
      const parsed = dataGrantsEnvelopeSchema.parse(raw);
      return { dataGrants: normalizeDataGrants(parsed.dataGrants) };
    },

    async updateMyDataGrants({ accessToken, gymOrgId, body }) {
      const payload: UpdateMyDataGrantsInput = {};
      if (body.optionalProfileAttributes !== undefined) {
        payload.optionalProfileAttributes = body.optionalProfileAttributes;
      }
      if (body.optionalClassGrants !== undefined) {
        payload.optionalClassGrants = body.optionalClassGrants;
      }
      const raw = await http.request<unknown>({
        path: endpoints.gymOrgMyDataGrants(gymOrgId),
        method: "PUT",
        accessToken,
        body: payload,
      });
      const parsed = dataGrantsEnvelopeSchema.parse(raw);
      return { dataGrants: normalizeDataGrants(parsed.dataGrants) };
    },
  };
}

/** Re-export for tests that assert payment enum without importing ports. */
export type { MembershipPaymentStatus };
