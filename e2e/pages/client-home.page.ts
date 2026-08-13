import type { Locator, Page } from '@playwright/test';

export class ClientHomePage {
    readonly page: Page;
    readonly heading: Locator;
    readonly inviteHeading: Locator;
    readonly acceptButton: Locator;
    readonly dataSharingHeading: Locator;
    readonly saveSharingButton: Locator;
    readonly adminSidebar: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Member home' });
        this.inviteHeading = page.getByRole('heading', { name: 'Gym invites' });
        this.acceptButton = page.getByRole('button', {
            name: 'Accept membership',
        });
        this.dataSharingHeading = page.getByRole('heading', {
            name: 'Data sharing',
        });
        this.saveSharingButton = page.getByRole('button', {
            name: 'Save sharing',
        });
        this.adminSidebar = page.getByRole('complementary', {
            name: 'Admin modules',
        });
    }

    async goto() {
        await this.page.goto('/client');
    }
}
