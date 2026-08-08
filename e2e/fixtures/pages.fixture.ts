import { test as base, expect } from "@playwright/test";

import { encodeClientSessionCookie } from "./client-session";
import {
  encodeStaffSessionCookie,
  encodeStaffSessionCookieNoGym,
} from "./staff-session";
import { AdminShellPage } from "../pages/admin-shell.page";
import { ClientHomePage } from "../pages/client-home.page";
import { LoginPage } from "../pages/login.page";
import { SettingsPage } from "../pages/settings.page";

type Pages = {
  loginPage: LoginPage;
  adminShellPage: AdminShellPage;
  clientHomePage: ClientHomePage;
  settingsPage: SettingsPage;
};

type AuthFixtures = {
  /** Staff cookie + gym affiliation; lands on Admin Operations. */
  staffAdmin: AdminShellPage;
  /** Staff cookie, zero gyms; lands on Settings-only first-run. */
  staffNoGym: SettingsPage;
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

  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
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
    const settings = new SettingsPage(page);
    await page.goto("/admin");
    await use(settings);
  },

  clientHome: async ({ context, page }, use) => {
    await context.addCookies([encodeClientSessionCookie()]);
    const home = new ClientHomePage(page);
    await home.goto();
    await use(home);
  },
});

export { expect };
