import { z } from "zod";

import { endpoints } from "@/lib/api/endpoints";
import type { HttpClient } from "@/lib/api/client";
import type { GymOrgsReader, GymOrgsWriter } from "@/lib/ports/gym-orgs";

/** GET /gym-orgs list item — includes isOwner. */
const gymOrgSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  timezone: z.string().min(1),
  isOwner: z.boolean(),
});

const listSchema = z.object({
  gymOrgs: z.array(gymOrgSummarySchema),
});

/**
 * POST /gym-orgs 201 body — Postman: no `isOwner` on create detail
 * (ownerUserId + timestamps instead).
 */
const createGymOrgDetailSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  timezone: z.string().min(1),
  ownerUserId: z.string().optional(),
  address: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isOwner: z.boolean().optional(),
});

const createSchema = z.object({
  gymOrg: createGymOrgDetailSchema,
});

export function createGymOrgsAdapter(
  http: HttpClient,
): GymOrgsReader & GymOrgsWriter {
  return {
    async list({ accessToken }) {
      const raw = await http.request<unknown>({
        path: endpoints.gymOrgs,
        method: "GET",
        accessToken,
      });
      return listSchema.parse(raw);
    },

    async create({ accessToken, body }) {
      const payload: Record<string, unknown> = {
        name: body.name,
        timezone: body.timezone ?? "Asia/Kolkata",
      };
      if (body.address !== undefined) {
        payload.address = body.address;
      }
      if (body.contactPhone !== undefined) {
        payload.contactPhone = body.contactPhone;
      }
      if (body.contactEmail !== undefined) {
        payload.contactEmail = body.contactEmail;
      }
      if (body.logoUrl !== undefined) {
        payload.logoUrl = body.logoUrl;
      }

      const raw = await http.request<unknown>({
        path: endpoints.gymOrgs,
        method: "POST",
        accessToken,
        body: payload,
      });
      const parsed = createSchema.parse(raw);
      return {
        gymOrg: {
          ...parsed.gymOrg,
          // Creator is owner; list endpoint exposes isOwner explicitly.
          isOwner: parsed.gymOrg.isOwner ?? true,
        },
      };
    },
  };
}
