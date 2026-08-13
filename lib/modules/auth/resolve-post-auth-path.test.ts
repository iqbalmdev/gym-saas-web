import { describe, expect, it } from "vitest";

import { otpSentSchema } from "@/lib/modules/auth/auth-adapter";
import { resolvePostAuthPath } from "@/lib/modules/auth/resolve-post-auth-path";

describe("otpSentSchema", () => {
  it("requires isNewUser from Request OTP", () => {
    expect(
      otpSentSchema.parse({ status: "OTP_SENT", isNewUser: true }),
    ).toEqual({ status: "OTP_SENT", isNewUser: true });
    expect(
      otpSentSchema.parse({ status: "OTP_SENT", isNewUser: false }),
    ).toEqual({ status: "OTP_SENT", isNewUser: false });
  });

  it("rejects legacy OTP_SENT without isNewUser", () => {
    expect(() => otpSentSchema.parse({ status: "OTP_SENT" })).toThrow();
  });
});

describe("resolvePostAuthPath", () => {
  it("sends CLIENT to the Client home", () => {
    expect(resolvePostAuthPath({ lane: "CLIENT", gymOrgCount: 0 })).toBe(
      "/client",
    );
  });

  it("sends STAFF with no gyms to Settings (create org / invites)", () => {
    expect(resolvePostAuthPath({ lane: "STAFF", gymOrgCount: 0 })).toBe(
      "/admin/settings",
    );
  });

  it("sends STAFF with gyms to Admin", () => {
    expect(resolvePostAuthPath({ lane: "STAFF", gymOrgCount: 1 })).toBe(
      "/admin",
    );
  });
});
