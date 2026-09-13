import type { Locator, Page } from '@playwright/test';

export class ClientNutritionPage {
    readonly page: Page;
    readonly heading: Locator;
    /** Both panels list foods, so every row assertion is scoped to one region. */
    readonly diary: Locator;
    readonly catalog: Locator;
    readonly dayInput: Locator;
    readonly foodSearchInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Nutrition', exact: true });
        this.diary = page.getByRole('region', { name: 'Food diary' });
        this.catalog = page.getByRole('region', { name: 'Food catalog' });
        this.dayInput = page.getByLabel('Day');
        this.foodSearchInput = page.getByLabel('Search foods');
    }

    async goto() {
        await this.page.goto('/client/nutrition');
    }

    diaryRow(foodName: string): Locator {
        return this.diary.getByRole('listitem').filter({ hasText: foodName });
    }

    catalogRow(foodName: string): Locator {
        return this.catalog.getByRole('listitem').filter({ hasText: foodName });
    }

    logButton(foodName: string, mealSlotLabel: string): Locator {
        return this.catalog.getByRole('button', { name: `Log ${foodName} to ${mealSlotLabel}` });
    }

    /** Matches the row button's aria-label, e.g. `Remove Idli from Breakfast`. */
    removeButton(foodName: string, mealSlotLabel: string): Locator {
        return this.diary.getByRole('button', { name: `Remove ${foodName} from ${mealSlotLabel}` });
    }
}
