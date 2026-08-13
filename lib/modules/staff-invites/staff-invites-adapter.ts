import { z } from "zod";

import { endpoints } from "@/lib/modules/staff-invites/staff-invites-endpoints";
import type { HttpClient } from "@/lib/api/client";
import type {
  StaffInvitesReader,
  StaffInvitesWriter,
} from "@/lib/modules/staff-invites/staff-invites-ports";

const staffInviteGymSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().nullable(),
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  logoUrl: z.string().nullable(),
  timezone: z.string().min(1),
});

const staffInviteSchema = z.object({
  id: z.string().min(1),
  gymOrgId: z.string().min(1),
  gym: staffInviteGymSchema.optional(),
  invitedUserId: z.string().min(1),
  targetRole: z.enum(["TRAINER", "ADMIN"]),
  status: z.enum(["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"]),
  expiresAt: z.string().min(1),
  createdBy: z.string().min(1),
  acceptedAt: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

const inviteEnvelopeSchema = z.object({
  staffInvite: staffInviteSchema,
});

const pageSchema = z.object({
  staffInvites: z.object({
    items: z.array(staffInviteSchema),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  }),
});

function pageQuery(limit?: number, offset?: number): string {
  const params = new URLSearchParams();
  params.set("limit", String(limit ?? 20));
  params.set("offset", String(offset ?? 0));
  return params.toString();
}

export function createStaffInvitesAdapter(
  http: HttpClient,
): StaffInvitesReader & StaffInvitesWriter {
  return {
    async listForGym({ accessToken, gymOrgId, limit, offset }) {
      const raw = await http.request<unknown>({
        path: `${endpoints.gymOrgStaffInvites(gymOrgId)}?${pageQuery(limit, offset)}`,
        method: "GET",
        accessToken,
      });
      return pageSchema.parse(raw);
    },

    async listInbox({ accessToken, limit, offset }) {
      const raw = await http.request<unknown>({
        path: `${endpoints.staffInviteInbox}?${pageQuery(limit, offset)}`,
        method: "GET",
        accessToken,
      });
      return pageSchema.parse(raw);
    },

    async create({ accessToken, gymOrgId, body }) {
      const payload: Record<string, unknown> = {
        staffCode: body.staffCode,
        targetRole: body.targetRole,
      };
      if (body.expiresAt) {
        payload.expiresAt = body.expiresAt;
      }
      const raw = await http.request<unknown>({
        path: endpoints.gymOrgStaffInvites(gymOrgId),
        method: "POST",
        accessToken,
        body: payload,
      });
      return inviteEnvelopeSchema.parse(raw);
    },

    async revoke({ accessToken, inviteId }) {
      const raw = await http.request<unknown>({
        path: endpoints.staffInviteRevoke(inviteId),
        method: "POST",
        accessToken,
      });
      return inviteEnvelopeSchema.parse(raw);
    },

    async accept({ accessToken, inviteId }) {
      const raw = await http.request<unknown>({
        path: endpoints.staffInviteAccept(inviteId),
        method: "POST",
        accessToken,
      });
      return inviteEnvelopeSchema.parse(raw);
    },
  };
}
