import type { Locator, Page } from "@playwright/test";

export class CreateGymPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly gymName: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Create your gym" });
    this.gymName = page.getByLabel("Gym name");
    this.createButton = page.getByRole("button", { name: "Create gym" });
  }

  async goto() {
    await this.page.goto("/onboarding/create-gym");
  }
}
