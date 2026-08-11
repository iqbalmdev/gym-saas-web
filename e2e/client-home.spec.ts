import { expect, test } from "./fixtures/pages.fixture";

test.describe("Client home", () => {
  test("CLIENT session shows member home without Admin nav", async ({
    clientHome,
  }) => {
    await expect(clientHome.heading).toBeVisible();
    await expect(clientHome.inviteHeading).toBeVisible();
    await expect(clientHome.adminSidebar).toHaveCount(0);
  });

  test("CLIENT can accept a pending membership invite", async ({
    clientHome,
  }) => {
    await expect(clientHome.acceptButton).toBeVisible();
    await clientHome.acceptButton.click();
    await expect(
      clientHome.page.getByText("Membership accepted"),
    ).toBeVisible();
  });
});
