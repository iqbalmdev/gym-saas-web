import { describe, expect, it } from "vitest";
import { z } from "zod";

const paymentStatusSchema = z.enum(["paid", "unpaid", "partial"]);

const inviteSchema = z.object({
  id: z.string().min(1),
  invitedEmail: z.string().min(1),
  inviteeName: z.string().min(1),
  inviteePhone: z.string().nullable(),
  basePlanId: z.string().min(1),
  basePaymentStatus: paymentStatusSchema,
  addonPlanId: z.string().nullable(),
  addonPaymentStatus: paymentStatusSchema.nullable(),
  status: z.enum(["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"]),
  expiresAt: z.string().min(1),
});

describe("Membership invite schemas (Postman tip ca849e0)", () => {
  it("parses pending invite shape from Examples", () => {
    const invite = inviteSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      invitedEmail: "alex.client@example.com",
      inviteeName: "Alex Client",
      inviteePhone: "+15551234567",
      basePlanId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      basePaymentStatus: "unpaid",
      addonPlanId: null,
      addonPaymentStatus: null,
      status: "PENDING",
      expiresAt: "2026-08-22T00:00:00.000Z",
    });
    expect(invite.status).toBe("PENDING");
    expect(invite.basePaymentStatus).toBe("unpaid");
  });

  it("parses revoked invite", () => {
    const invite = inviteSchema.parse({
      id: "invite-2",
      invitedEmail: "client_demo_001@example.com",
      inviteeName: "Demo Client",
      inviteePhone: null,
      basePlanId: "plan-base",
      basePaymentStatus: "paid",
      addonPlanId: "plan-addon",
      addonPaymentStatus: "partial",
      status: "REVOKED",
      expiresAt: "2026-08-22T00:00:00.000Z",
    });
    expect(invite.addonPlanId).toBe("plan-addon");
    expect(invite.status).toBe("REVOKED");
  });

  it("parses inbox item with embedded gym", () => {
    const gym = z
      .object({
        id: z.string().min(1),
        name: z.string().min(1),
        timezone: z.string().min(1),
      })
      .parse({
        id: "33333333-3333-4333-8333-333333333333",
        name: "Iron Temple",
        timezone: "Asia/Kolkata",
      });
    expect(gym.name).toBe("Iron Temple");
  });

  it("parses accept envelope", () => {
    const parsed = z
      .object({
        membershipId: z.string().min(1),
        grants: z.object({
          profileAttributes: z.array(z.string()),
          classGrants: z.array(z.string()),
        }),
      })
      .parse({
        membershipId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        grants: {
          profileAttributes: ["DOB", "HEIGHT", "WEIGHT", "GENDER"],
          classGrants: ["PROGRESS"],
        },
      });
    expect(parsed.grants.profileAttributes).toContain("DOB");
  });
});
