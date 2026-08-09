/** Membership plan catalog — Postman Plans folder. */

export type PlanKind = "BASE" | "ADDON";

export type PlanCapability = "TRAINER_COACHING";

export type MembershipPlan = {
  id: string;
  gymOrgId: string;
  name: string;
  kind: PlanKind;
  capability: PlanCapability | null;
  durationDays: number;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlanPage = {
  items: MembershipPlan[];
  total: number;
  limit: number;
  offset: number;
};

export type CreatePlanInput = {
  name: string;
  kind: PlanKind;
  durationDays: number;
  price: number;
  /** Required when kind is ADDON (MVP: TRAINER_COACHING only). */
  capability?: PlanCapability;
};

export type UpdatePlanInput = {
  name?: string;
  durationDays?: number;
  price?: number;
  active?: boolean;
};

export type PlansReader = {
  list: (input: {
    accessToken: string;
    gymOrgId: string;
    kind?: PlanKind;
    active?: boolean;
    limit?: number;
    offset?: number;
  }) => Promise<{ plans: PlanPage }>;

  get: (input: {
    accessToken: string;
    gymOrgId: string;
    planId: string;
  }) => Promise<{ plan: MembershipPlan }>;
};

export type PlansWriter = {
  create: (input: {
    accessToken: string;
    gymOrgId: string;
    body: CreatePlanInput;
  }) => Promise<{ plan: MembershipPlan }>;

  update: (input: {
    accessToken: string;
    gymOrgId: string;
    planId: string;
    body: UpdatePlanInput;
  }) => Promise<{ plan: MembershipPlan }>;

  softDelete: (input: {
    accessToken: string;
    gymOrgId: string;
    planId: string;
  }) => Promise<void>;
};
