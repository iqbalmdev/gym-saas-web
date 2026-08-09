import { expect, test } from "./fixtures/pages.fixture";

test.describe("Staff invites", () => {
  test("Admin can open Settings and see create + list", async ({
    staffAdmin,
    settingsPage,
    page,
  }) => {
    await staffAdmin.moduleLink("Settings").click();
    await expect(page).toHaveURL(/\/admin\/settings/);
    await expect(settingsPage.heading).toBeVisible();
    await expect(settingsPage.staffInvitesHeading).toBeVisible();
    await expect(settingsPage.staffCodeInput).toBeVisible();
    await expect(settingsPage.sendInviteButton).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();
    await expect(settingsPage.revokeButton).toBeVisible();
  });

  test("Admin can create a staff invite", async ({
    staffAdmin,
    settingsPage,
    page,
  }) => {
    await settingsPage.goto();
    await expect(staffAdmin.sidebar).toBeVisible();
    await settingsPage.staffCodeInput.fill("STF-NEW01");
    await page.getByLabel("Role").selectOption("TRAINER");
    await settingsPage.sendInviteButton.click();
    await expect(page.getByText("Trainer").first()).toBeVisible();
  });

  test("Staff without gym sees inbox and can accept", async ({
    staffNoGym,
    page,
  }) => {
    await expect(page).toHaveURL(/\/admin\/settings/);
    await expect(staffNoGym.heading).toBeVisible();
    await expect(staffNoGym.inviteInboxHeading).toBeVisible();
    await expect(page.getByText("E2E Gym").first()).toBeVisible();
    await expect(page.getByText(/Join as Trainer/i)).toBeVisible();
    await staffNoGym.acceptInviteButton.click();
    await expect(page).toHaveURL(/\/admin/);
    await expect(
      page.getByRole("heading", { name: "Operations" }),
    ).toBeVisible();
  });
});
