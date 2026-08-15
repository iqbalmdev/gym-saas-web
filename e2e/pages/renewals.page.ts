import type { Locator, Page } from '@playwright/test';

export class RenewalsPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly renewalsDueHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', {
            name: 'Renewals',
            exact: true,
        });
        this.renewalsDueHeading = page.getByRole('heading', {
            name: 'Renewals due',
            exact: true,
        });
    }

    async goto() {
        await this.page.goto('/admin/renewals');
    }
}
