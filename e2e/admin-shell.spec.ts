import { expect, test } from "./fixtures/pages.fixture";

test.describe("Admin collapsible sidebar", () => {
  test("shows module labels when expanded and icons-only when collapsed", async ({
    staffAdmin,
  }) => {
    await test.step("Expanded: Renewals label is visible", async () => {
      await expect(staffAdmin.moduleLink("Renewals")).toBeVisible();
      await expect(staffAdmin.moduleLink("Renewals")).toHaveText("Renewals");
      await expect(staffAdmin.collapseSidebar).toBeVisible();
    });

    await test.step("Collapse to icon rail", async () => {
      await staffAdmin.collapseSidebar.click();
      await expect(staffAdmin.expandSidebar).toBeVisible();
      const renewals = staffAdmin.moduleLink("Renewals");
      await expect(renewals).toBeVisible();
      await expect(renewals).toHaveAttribute("aria-label", "Renewals");
      await expect(renewals).not.toHaveText("Renewals");
    });

    await test.step("Expand again restores labels", async () => {
      await staffAdmin.expandSidebar.click();
      await expect(staffAdmin.moduleLink("Renewals")).toHaveText("Renewals");
    });
  });

  test("navigates to Settings from the sidebar", async ({ staffAdmin, page }) => {
    await staffAdmin.moduleLink("Settings").click();
    await expect(page).toHaveURL(/\/admin\/settings/);
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });
});

test.describe("Staff without gym", () => {
  test("is sent to create-gym instead of Admin modules", async ({
    staffNoGym,
    page,
  }) => {
    await expect(page).toHaveURL(/\/onboarding\/create-gym/);
    await expect(staffNoGym.heading).toBeVisible();
    await expect(staffNoGym.gymName).toBeVisible();
  });
});
