import { test as base, expect } from "@playwright/test";

import { encodeClientSessionCookie } from "./client-session";
import {
  encodeStaffSessionCookie,
  encodeStaffSessionCookieNoGym,
} from "./staff-session";
import { AdminShellPage } from "../pages/admin-shell.page";
import { ClientHomePage } from "../pages/client-home.page";
import { CreateGymPage } from "../pages/create-gym.page";
import { LoginPage } from "../pages/login.page";

type Pages = {
  loginPage: LoginPage;
  adminShellPage: AdminShellPage;
  clientHomePage: ClientHomePage;
  createGymPage: CreateGymPage;
};

type AuthFixtures = {
  /** Staff cookie + gym affiliation; lands on Admin Operations. */
  staffAdmin: AdminShellPage;
  /** Staff cookie, zero gyms; /admin redirects to create-gym. */
  staffNoGym: CreateGymPage;
  /** Client cookie; Member home. */
  clientHome: ClientHomePage;
};

export const test = base.extend<Pages & AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  adminShellPage: async ({ page }, use) => {
    await use(new AdminShellPage(page));
  },

  clientHomePage: async ({ page }, use) => {
    await use(new ClientHomePage(page));
  },

  createGymPage: async ({ page }, use) => {
    await use(new CreateGymPage(page));
  },

  staffAdmin: async ({ context, page }, use) => {
    await context.addCookies([encodeStaffSessionCookie()]);
    await page.addInitScript(() => {
      localStorage.setItem("gym-saas-sidebar-expanded", "1");
    });
    const shell = new AdminShellPage(page);
    await shell.gotoDashboard();
    await shell.expectShellReady();
    await use(shell);
  },

  staffNoGym: async ({ context, page }, use) => {
    await context.addCookies([encodeStaffSessionCookieNoGym()]);
    const createGym = new CreateGymPage(page);
    await page.goto("/admin");
    await use(createGym);
  },

  clientHome: async ({ context, page }, use) => {
    await context.addCookies([encodeClientSessionCookie()]);
    const home = new ClientHomePage(page);
    await home.goto();
    await use(home);
  },
});

export { expect };
