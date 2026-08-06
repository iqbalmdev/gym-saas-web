import type { Locator, Page } from "@playwright/test";

export class ClientHomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly adminSidebar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Member home" });
    this.adminSidebar = page.getByRole("complementary", {
      name: "Admin modules",
    });
  }

  async goto() {
    await this.page.goto("/client");
  }
}
