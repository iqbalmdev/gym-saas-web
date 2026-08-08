import type { Locator, Page } from "@playwright/test";

export class SettingsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createGymHeading: Locator;
  readonly gymName: Locator;
  readonly createGymButton: Locator;
  readonly inviteInboxHeading: Locator;
  readonly acceptInviteButton: Locator;
  readonly staffInvitesHeading: Locator;
  readonly staffCodeInput: Locator;
  readonly sendInviteButton: Locator;
  readonly revokeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Settings" });
    this.createGymHeading = page.getByRole("heading", {
      name: "Create your gym",
    });
    this.gymName = page.getByLabel("Gym name");
    this.createGymButton = page.getByRole("button", { name: "Create gym" });
    this.inviteInboxHeading = page.getByRole("heading", {
      name: "Your staff invites",
    });
    this.acceptInviteButton = page.getByRole("button", { name: "Accept" });
    this.staffInvitesHeading = page.getByRole("heading", {
      name: "Staff invites",
    });
    this.staffCodeInput = page.getByLabel("Staff code");
    this.sendInviteButton = page.getByRole("button", { name: "Send invite" });
    this.revokeButton = page.getByRole("button", { name: "Revoke" }).first();
  }

  async goto() {
    await this.page.goto("/admin/settings");
  }
}
