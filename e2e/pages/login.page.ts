import type { Locator, Page } from "@playwright/test";

export type AuthLaneChoice = "STAFF" | "CLIENT";

/**
 * Login POM — email first; lane only when isNewUser (client-auth.md).
 */
export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly laneHeading: Locator;
  readonly staffLane: Locator;
  readonly clientLane: Locator;
  readonly continueLane: Locator;
  readonly email: Locator;
  readonly sendCode: Locator;
  readonly otp: Locator;
  readonly verifyContinue: Locator;
  readonly themeToggle: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Sign in" });
    this.laneHeading = page.getByRole("heading", {
      name: "Confirm your account type",
    });
    this.staffLane = page.getByRole("radio", { name: /I work at a gym/i });
    this.clientLane = page.getByRole("radio", { name: /I.m a member/i });
    this.continueLane = page.getByRole("button", { name: "Continue to code" });
    this.email = page.getByLabel("Email");
    this.sendCode = page.getByRole("button", { name: "Send code" });
    this.otp = page.getByLabel("Email code");
    this.verifyContinue = page.getByRole("button", { name: "Continue" });
    this.themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) mode/i,
    });
    this.alert = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async requestCode(email: string) {
    await this.email.fill(email);
    await this.sendCode.click();
  }

  async chooseLane(lane: AuthLaneChoice) {
    if (lane === "STAFF") {
      await this.staffLane.check();
    } else {
      await this.clientLane.check();
    }
    await this.continueLane.click();
  }

  async enterOtp(code: string) {
    await this.otp.fill(code);
  }

  async submitOtp() {
    await this.verifyContinue.click();
  }

  /** New user (E2E: email local-part `new…`): email → lane → OTP. */
  async signInNewUser(input: {
    lane: AuthLaneChoice;
    email: string;
    otp?: string;
  }) {
    await this.goto();
    await this.requestCode(input.email);
    await this.chooseLane(input.lane);
    await this.enterOtp(input.otp ?? "123456");
    await this.submitOtp();
  }

  /** Returning user (E2E: email not `new…`): email → OTP only. */
  async signInReturningUser(input: { email: string; otp?: string }) {
    await this.goto();
    await this.requestCode(input.email);
    await this.enterOtp(input.otp ?? "123456");
    await this.submitOtp();
  }
}
