import type { Locator, Page } from '@playwright/test';

export class AdminShellPage {
    readonly page: Page;
    readonly sidebar: Locator;
    readonly operationsHeading: Locator;
    readonly collapseSidebar: Locator;
    readonly expandSidebar: Locator;

    constructor(page: Page) {
        this.page = page;
        this.sidebar = page.getByRole('complementary', { name: 'Admin modules' });
        this.operationsHeading = page.getByRole('heading', { name: 'Operations' });
        this.collapseSidebar = page.getByRole('button', { name: 'Collapse sidebar' });
        this.expandSidebar = page.getByRole('button', { name: 'Expand sidebar' });
    }

    async gotoDashboard() {
        await this.page.goto('/admin');
    }

    moduleLink(name: string): Locator {
        return this.sidebar.getByRole('link', { name, exact: true });
    }

    async expectShellReady() {
        await this.page.waitForFunction(
            () => document.documentElement.getAttribute('data-admin-shell-ready') === 'true',
        );
        await this.operationsHeading.waitFor({ state: 'visible' });
    }
}
