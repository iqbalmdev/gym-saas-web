import { expect, test } from "./fixtures/pages.fixture";

test.describe("Theme toggle", () => {
  test("switches data-theme between light and dark on login", async ({
    loginPage,
    page,
  }) => {
    await test.step("Open login with stored light preference", async () => {
      await page.addInitScript(() => {
        localStorage.setItem("gym-saas-theme", "light");
      });
      await loginPage.goto();
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme-ready",
        "true",
      );
      await expect(loginPage.heading).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await expect(
        page.getByRole("button", { name: "Switch to dark mode" }),
      ).toBeVisible();
    });

    await test.step("Toggle to dark", async () => {
      await page.getByRole("button", { name: "Switch to dark mode" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect
        .poll(() => page.evaluate(() => localStorage.getItem("gym-saas-theme")))
        .toBe("dark");
    });

    await test.step("Toggle back to light", async () => {
      await page.getByRole("button", { name: "Switch to light mode" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    });
  });
});
