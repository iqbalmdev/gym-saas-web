import { expect, test } from "./fixtures/pages.fixture";

test.describe("Members roster", () => {
  test("Admin sees roster member and can toggle check-in block", async ({
    staffAdmin,
    membersPage,
    page,
  }) => {
    await staffAdmin.moduleLink("Members").click();
    await expect(page).toHaveURL(/\/admin\/members/);
    await expect(membersPage.heading).toBeVisible();
    await expect(membersPage.rosterHeading).toBeVisible();
    await expect(page.getByText("Ada Client")).toBeVisible();
    await expect(page.getByText("Allowed").first()).toBeVisible();

    await membersPage.blockCheckInButton.first().click();
    await expect(page.getByText("Blocked").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Unblock check-in" }).first(),
    ).toBeVisible();

    // Restore for other specs that share the in-process E2E fixture state.
    await page.getByRole("button", { name: "Unblock check-in" }).first().click();
    await expect(page.getByText("Allowed").first()).toBeVisible();
  });
});
