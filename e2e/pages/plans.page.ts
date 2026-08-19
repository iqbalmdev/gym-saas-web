import type { Locator, Page } from '@playwright/test';

export class PlansPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly nameInput: Locator;
    readonly durationInput: Locator;
    readonly priceInput: Locator;
    readonly createButton: Locator;
    readonly catalogHeading: Locator;
    readonly filterTabs: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Plans', exact: true });
        this.nameInput = page.getByLabel('Name', { exact: true });
        this.durationInput = page.getByLabel('Duration (days)', { exact: true });
        this.priceInput = page.getByLabel('Price (INR)', { exact: true });
        this.createButton = page.getByRole('button', { name: 'Create plan' });
        this.catalogHeading = page.getByRole('heading', { name: /Catalog for/ });
        this.filterTabs = page.getByRole('navigation', { name: 'Filter plans by kind' });
    }

    filterTab(label: string): Locator {
        return this.filterTabs.getByRole('link', { name: label, exact: true });
    }

    async goto() {
        await this.page.goto('/admin/plans');
    }

    async createBasePlan(name: string, durationDays: string, price: string) {
        await this.nameInput.fill(name);
        await this.durationInput.fill(durationDays);
        await this.priceInput.fill(price);
        await this.createButton.click();
    }

    planRow(name: string): Locator {
        return this.page.getByRole('listitem').filter({ hasText: name });
    }

    toggleButton(name: string): Locator {
        return this.planRow(name).getByRole('button', { name: /Deactivate|Activate/ });
    }

    deleteButton(name: string): Locator {
        return this.planRow(name).getByRole('button', { name: 'Delete' });
    }
}
