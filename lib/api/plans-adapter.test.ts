import { describe, expect, it } from "vitest";
import { z } from "zod";

const planSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(["BASE", "ADDON"]),
  capability: z.enum(["TRAINER_COACHING"]).nullable(),
  durationDays: z.number().int().positive(),
  price: z.number().nonnegative(),
  active: z.boolean(),
});

describe("Plans response schemas (Postman tip 7a2d9bf)", () => {
  it("parses BASE plan shape", () => {
    const plan = planSchema.parse({
      id: "plan-1",
      name: "Monthly",
      kind: "BASE",
      capability: null,
      durationDays: 30,
      price: 999,
      active: true,
    });
    expect(plan.kind).toBe("BASE");
    expect(plan.capability).toBeNull();
  });

  it("parses ADDON plan with TRAINER_COACHING", () => {
    const plan = planSchema.parse({
      id: "plan-2",
      name: "PT Coaching",
      kind: "ADDON",
      capability: "TRAINER_COACHING",
      durationDays: 30,
      price: 1500,
      active: true,
    });
    expect(plan.capability).toBe("TRAINER_COACHING");
  });
});
