import { describe, expect, it } from "vitest";
import { z } from "zod";

const paymentStatusSchema = z.enum(["paid", "unpaid", "partial"]);

const renewalItemSchema = z.object({
  id: z.string().min(1),
  clientMembershipId: z.string().min(1),
  planId: z.string().min(1),
  kind: z.enum(["BASE", "ADDON"]),
  priceAmount: z.number(),
  durationDays: z.number().int().positive(),
  endDate: z.string().nullable(),
  paymentStatus: paymentStatusSchema,
  amountPaid: z.number(),
  clientUserId: z.string().min(1),
});

describe("Subscriptions schemas (Postman tip 91d4aba)", () => {
  it("parses renewals-due item from Examples", () => {
    const item = renewalItemSchema.parse({
      id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      clientMembershipId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      planId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      kind: "BASE",
      priceAmount: 999,
      durationDays: 30,
      endDate: "2026-08-30",
      paymentStatus: "unpaid",
      amountPaid: 0,
      clientUserId: "22222222-2222-4222-8222-222222222222",
    });
    expect(item.kind).toBe("BASE");
    expect(item.paymentStatus).toBe("unpaid");
  });

  it("parses payment update subscription", () => {
    const subscription = z
      .object({
        id: z.string().min(1),
        paymentStatus: paymentStatusSchema,
        amountPaid: z.number(),
      })
      .parse({
        id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        paymentStatus: "paid",
        amountPaid: 999,
      });
    expect(subscription.paymentStatus).toBe("paid");
  });
});
