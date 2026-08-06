import { expect, test } from "./fixtures/pages.fixture";

test.describe("Login (isNewUser)", () => {
  test("starts on email, not lane", async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.email).toBeVisible();
    await expect(loginPage.sendCode).toBeVisible();
    await expect(loginPage.laneHeading).toHaveCount(0);
  });

  test("unauthenticated Admin visitors land on login", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.heading).toBeVisible();
  });

  test("new user sees lane after Send code", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.requestCode("new@example.com");
    await expect(loginPage.laneHeading).toBeVisible();
    await expect(loginPage.staffLane).toBeVisible();
    await expect(loginPage.clientLane).toBeVisible();
    await expect(loginPage.otp).toHaveCount(0);
  });

  test("returning user skips lane and sees OTP", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.requestCode("returning@example.com");
    await expect(loginPage.otp).toBeVisible();
    await expect(loginPage.laneHeading).toHaveCount(0);
    await expect(
      loginPage.page.getByText(/welcome back/i),
    ).toBeVisible();
  });

  test("lane Continue stays disabled until a type is chosen", async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.requestCode("new@example.com");
    await expect(loginPage.continueLane).toBeDisabled();
    await loginPage.staffLane.check();
    await expect(loginPage.continueLane).toBeEnabled();
  });

  test("new Staff reaches OTP after lane", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.requestCode("new@example.com");
    await loginPage.chooseLane("STAFF");
    await expect(loginPage.otp).toBeVisible();
    await expect(
      loginPage.page.getByText(/We sent a code to new@example.com/),
    ).toBeVisible();
  });

  test("OTP Continue stays disabled until 6 digits", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.requestCode("returning@example.com");
    await expect(loginPage.verifyContinue).toBeDisabled();
    await loginPage.enterOtp("12345");
    await expect(loginPage.verifyContinue).toBeDisabled();
    await loginPage.enterOtp("123456");
    await expect(loginPage.verifyContinue).toBeEnabled();
  });
});

test.describe("OTP sign-in destinations (E2E fixtures)", () => {
  test("new Staff lands on create-gym", async ({
    loginPage,
    createGymPage,
    page,
  }) => {
    await loginPage.signInNewUser({
      lane: "STAFF",
      email: "new.staff@example.com",
    });
    await expect(page).toHaveURL(/\/onboarding\/create-gym/);
    await expect(createGymPage.heading).toBeVisible();
  });

  test("new Client lands on member home", async ({
    loginPage,
    clientHomePage,
    page,
  }) => {
    await loginPage.signInNewUser({
      lane: "CLIENT",
      email: "new.member@example.com",
    });
    await expect(page).toHaveURL(/\/client/);
    await expect(clientHomePage.heading).toBeVisible();
    await expect(clientHomePage.adminSidebar).toHaveCount(0);
  });

  test("returning Staff without gym still lands on create-gym", async ({
    loginPage,
    createGymPage,
    page,
  }) => {
    // Fixture verify without lane defaults STAFF + no-gym token.
    await loginPage.signInReturningUser({
      email: "returning.staff@example.com",
    });
    await expect(page).toHaveURL(/\/onboarding\/create-gym/);
    await expect(createGymPage.heading).toBeVisible();
  });
});
