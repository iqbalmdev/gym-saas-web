import { describe, expect, it } from "vitest";
import { z } from "zod";

const leadSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  status: z.enum(["NEW", "CONTACTED", "TRIAL", "CONVERTED", "LOST"]),
});

describe("Leads response schemas (Postman tip 7a2d9bf)", () => {
  it("parses create lead core shape", () => {
    const lead = leadSchema.parse({
      id: "lead-1",
      name: "Walk-in Prospect",
      phone: "9876543210",
      status: "NEW",
    });
    expect(lead.status).toBe("NEW");
  });
});
