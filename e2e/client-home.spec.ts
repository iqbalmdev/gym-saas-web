import { expect, test } from "./fixtures/pages.fixture";

test.describe("Client home", () => {
  test("CLIENT session shows member home without Admin nav", async ({
    clientHome,
  }) => {
    await expect(clientHome.heading).toBeVisible();
    await expect(clientHome.adminSidebar).toHaveCount(0);
  });
});
