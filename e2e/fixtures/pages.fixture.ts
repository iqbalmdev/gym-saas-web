import { test as base, expect } from '@playwright/test';

import { encodeClientSessionCookie } from './client-session';
import { encodeStaffSessionCookie, encodeStaffSessionCookieNoGym } from './staff-session';
import { AdminShellPage } from '../pages/admin-shell.page';
import { AttendancePage } from '../pages/attendance.page';
import { ClientDietPage } from '../pages/client-diet.page';
import { ClientHealthPage } from '../pages/client-health.page';
import { ClientHomePage } from '../pages/client-home.page';
import { ClientNutritionPage } from '../pages/client-nutrition.page';
import { ClientProfilePage } from '../pages/client-profile.page';
import { ClientWorkoutsPage } from '../pages/client-workouts.page';
import { CrmPage } from '../pages/crm.page';
import { LoginPage } from '../pages/login.page';
import { MembersPage } from '../pages/members.page';
import { PlansPage } from '../pages/plans.page';
import { RenewalsPage } from '../pages/renewals.page';
import { SettingsPage } from '../pages/settings.page';

type Pages = {
    loginPage: LoginPage;
    adminShellPage: AdminShellPage;
    clientHomePage: ClientHomePage;
    clientProfilePage: ClientProfilePage;
    clientHealthPage: ClientHealthPage;
    clientNutritionPage: ClientNutritionPage;
    clientDietPage: ClientDietPage;
    clientWorkoutsPage: ClientWorkoutsPage;
    settingsPage: SettingsPage;
    membersPage: MembersPage;
    attendancePage: AttendancePage;
    renewalsPage: RenewalsPage;
    crmPage: CrmPage;
    plansPage: PlansPage;
};

type AuthFixtures = {
    /** Staff cookie + gym affiliation; lands on Admin Operations. */
    staffAdmin: AdminShellPage;
    /** Staff cookie, zero gyms; lands on Settings-only first-run. */
    staffNoGym: SettingsPage;
    /** Client cookie; Member home. */
    clientHome: ClientHomePage;
    /** Client cookie; Profile & progress. */
    clientProfile: ClientProfilePage;
    /** Client cookie; Health Sync connections + metrics. */
    clientHealth: ClientHealthPage;
    /** Client cookie; food diary + catalog. */
    clientNutrition: ClientNutritionPage;
    /** Client cookie; assigned diet plan. */
    clientDiet: ClientDietPage;
    /** Client cookie; workout schedule + streak. */
    clientWorkouts: ClientWorkoutsPage;
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

    clientProfilePage: async ({ page }, use) => {
        await use(new ClientProfilePage(page));
    },

    clientHealthPage: async ({ page }, use) => {
        await use(new ClientHealthPage(page));
    },

    clientNutritionPage: async ({ page }, use) => {
        await use(new ClientNutritionPage(page));
    },

    clientDietPage: async ({ page }, use) => {
        await use(new ClientDietPage(page));
    },

    clientWorkoutsPage: async ({ page }, use) => {
        await use(new ClientWorkoutsPage(page));
    },

    settingsPage: async ({ page }, use) => {
        await use(new SettingsPage(page));
    },

    membersPage: async ({ page }, use) => {
        await use(new MembersPage(page));
    },

    attendancePage: async ({ page }, use) => {
        await use(new AttendancePage(page));
    },

    renewalsPage: async ({ page }, use) => {
        await use(new RenewalsPage(page));
    },

    crmPage: async ({ page }, use) => {
        await use(new CrmPage(page));
    },

    plansPage: async ({ page }, use) => {
        await use(new PlansPage(page));
    },

    staffAdmin: async ({ context, page }, use) => {
        // No `sidebar_state` cookie means the shell defaults to expanded (SSR-known, no flash).
        await context.addCookies([encodeStaffSessionCookie()]);
        const shell = new AdminShellPage(page);
        await shell.gotoDashboard();
        await shell.expectShellReady();
        await use(shell);
    },

    staffNoGym: async ({ context, page }, use) => {
        await context.addCookies([encodeStaffSessionCookieNoGym()]);
        const settings = new SettingsPage(page);
        await page.goto('/admin');
        await use(settings);
    },

    clientHome: async ({ context, page }, use) => {
        await context.addCookies([encodeClientSessionCookie()]);
        const home = new ClientHomePage(page);
        await home.goto();
        await use(home);
    },

    clientProfile: async ({ context, page }, use) => {
        await context.addCookies([encodeClientSessionCookie()]);
        const profile = new ClientProfilePage(page);
        await profile.goto();
        await use(profile);
    },

    clientHealth: async ({ context, page }, use) => {
        await context.addCookies([encodeClientSessionCookie()]);
        const health = new ClientHealthPage(page);
        await health.goto();
        await use(health);
    },

    clientNutrition: async ({ context, page }, use) => {
        await context.addCookies([encodeClientSessionCookie()]);
        const nutrition = new ClientNutritionPage(page);
        await nutrition.goto();
        await use(nutrition);
    },

    clientDiet: async ({ context, page }, use) => {
        await context.addCookies([encodeClientSessionCookie()]);
        const diet = new ClientDietPage(page);
        await diet.goto();
        await use(diet);
    },

    clientWorkouts: async ({ context, page }, use) => {
        await context.addCookies([encodeClientSessionCookie()]);
        const workouts = new ClientWorkoutsPage(page);
        await workouts.goto();
        await use(workouts);
    },
});

export { expect };
