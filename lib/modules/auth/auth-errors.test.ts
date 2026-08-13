import { describe, expect, it } from "vitest";

import { authErrorMessage } from "@/lib/modules/auth/auth-errors";

describe("authErrorMessage", () => {
  it("maps known OTP failure codes to calm Admin copy", () => {
    expect(authErrorMessage("OTP_EXPIRED")).toBe(
      "That code is wrong or expired. Request a new one.",
    );
  });

  it("asks for lane when the API requires it on first provision", () => {
    expect(authErrorMessage("LANE_REQUIRED")).toBe(
      "Choose whether you work at a gym or you are a member.",
    );
  });

  it("maps Google OAuth configuration and identity failures", () => {
    expect(authErrorMessage("OAUTH_CONFIGURATION")).toMatch(/email code/i);
    expect(authErrorMessage("GOOGLE_IDENTITY_REQUIRED")).toMatch(/verified email/i);
  });

  it("does not expose raw unknown codes — uses fallback or generic copy", () => {
    expect(authErrorMessage("SOME_INTERNAL_STACK")).toBe(
      "Something went wrong. Please try again.",
    );
    expect(authErrorMessage("SOME_INTERNAL_STACK", "Try again later.")).toBe(
      "Try again later.",
    );
  });
});
