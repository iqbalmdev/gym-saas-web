import type { Locator, Page } from "@playwright/test";

export class AttendancePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly deskMarkHeading: Locator;
  readonly memberSelect: Locator;
  readonly markButton: Locator;
  readonly todayHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {
      name: "Attendance",
      exact: true,
    });
    this.deskMarkHeading = page.getByRole("heading", {
      name: "Desk mark",
      exact: true,
    });
    this.memberSelect = page.getByLabel("Member", { exact: true });
    this.markButton = page.getByRole("button", { name: "Mark attendance" });
    this.todayHeading = page.getByRole("heading", {
      name: "Today's attendance",
      exact: true,
    });
  }

  async goto() {
    await this.page.goto("/admin/attendance");
  }
}
