import type { Locator, Page } from '@playwright/test';

export class ClientDietPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly planPanel: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Diet', exact: true });
        this.planPanel = page.locator('section[aria-labelledby="client-diet-plan-heading"]');
    }

    async goto() {
        await this.page.goto('/client/diet');
    }

    dietItemCheckbox(foodName: string): Locator {
        return this.page.getByRole('checkbox', { name: new RegExp(`Mark ${foodName}`, 'i') });
    }
}
