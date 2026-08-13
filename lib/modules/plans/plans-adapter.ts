import { z } from "zod";

import { endpoints } from "@/lib/modules/plans/plans-endpoints";
import type { HttpClient } from "@/lib/api/client";
import type {
  CreatePlanInput,
  MembershipPlan,
  PlanKind,
  PlansReader,
  PlansWriter,
  UpdatePlanInput,
} from "@/lib/modules/plans/plans-ports";

const planSchema = z.object({
  id: z.string().min(1),
  gymOrgId: z.string().min(1).optional(),
  name: z.string().min(1),
  kind: z.enum(["BASE", "ADDON"]),
  capability: z.enum(["TRAINER_COACHING"]).nullable(),
  durationDays: z.number().int().positive(),
  price: z.number().nonnegative(),
  active: z.boolean(),
  createdAt: z.string().min(1).optional(),
  updatedAt: z.string().min(1).optional(),
});

function normalizePlan(
  raw: z.infer<typeof planSchema>,
  gymOrgId: string,
): MembershipPlan {
  return {
    id: raw.id,
    gymOrgId: raw.gymOrgId ?? gymOrgId,
    name: raw.name,
    kind: raw.kind,
    capability: raw.capability,
    durationDays: raw.durationDays,
    price: raw.price,
    active: raw.active,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

const planEnvelopeSchema = z.object({
  plan: planSchema,
});

const pageSchema = z.object({
  plans: z.object({
    items: z.array(planSchema),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  }),
});

function listQuery(input: {
  kind?: PlanKind;
  active?: boolean;
  limit?: number;
  offset?: number;
}): string {
  const params = new URLSearchParams();
  params.set("limit", String(input.limit ?? 50));
  params.set("offset", String(input.offset ?? 0));
  if (input.kind) {
    params.set("kind", input.kind);
  }
  if (input.active !== undefined) {
    params.set("active", String(input.active));
  }
  return params.toString();
}

export function createPlansAdapter(
  http: HttpClient,
): PlansReader & PlansWriter {
  return {
    async list({ accessToken, gymOrgId, kind, active, limit, offset }) {
      const raw = await http.request<unknown>({
        path: `${endpoints.gymOrgPlans(gymOrgId)}?${listQuery({ kind, active, limit, offset })}`,
        method: "GET",
        accessToken,
      });
      const parsed = pageSchema.parse(raw);
      return {
        plans: {
          ...parsed.plans,
          items: parsed.plans.items.map((item) =>
            normalizePlan(item, gymOrgId),
          ),
        },
      };
    },

    async get({ accessToken, gymOrgId, planId }) {
      const raw = await http.request<unknown>({
        path: endpoints.gymOrgPlan(gymOrgId, planId),
        method: "GET",
        accessToken,
      });
      const parsed = planEnvelopeSchema.parse(raw);
      return { plan: normalizePlan(parsed.plan, gymOrgId) };
    },

    async create({ accessToken, gymOrgId, body }) {
      const payload: CreatePlanInput = {
        name: body.name,
        kind: body.kind,
        durationDays: body.durationDays,
        price: body.price,
      };
      if (body.capability) {
        payload.capability = body.capability;
      }
      const raw = await http.request<unknown>({
        path: endpoints.gymOrgPlans(gymOrgId),
        method: "POST",
        accessToken,
        body: payload,
      });
      const parsed = planEnvelopeSchema.parse(raw);
      return { plan: normalizePlan(parsed.plan, gymOrgId) };
    },

    async update({ accessToken, gymOrgId, planId, body }) {
      const payload: UpdatePlanInput = {};
      if (body.name !== undefined) {
        payload.name = body.name;
      }
      if (body.durationDays !== undefined) {
        payload.durationDays = body.durationDays;
      }
      if (body.price !== undefined) {
        payload.price = body.price;
      }
      if (body.active !== undefined) {
        payload.active = body.active;
      }
      const raw = await http.request<unknown>({
        path: endpoints.gymOrgPlan(gymOrgId, planId),
        method: "PATCH",
        accessToken,
        body: payload,
      });
      const parsed = planEnvelopeSchema.parse(raw);
      return { plan: normalizePlan(parsed.plan, gymOrgId) };
    },

    async softDelete({ accessToken, gymOrgId, planId }) {
      await http.request<unknown>({
        path: endpoints.gymOrgPlan(gymOrgId, planId),
        method: "DELETE",
        accessToken,
      });
    },
  };
}
