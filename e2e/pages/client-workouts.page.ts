import type { Locator, Page } from '@playwright/test';

export class ClientWorkoutsPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly streakPanel: Locator;
    readonly schedulePanel: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Workouts', exact: true });
        this.streakPanel = page.getByRole('heading', { name: 'Streak', exact: true }).locator('..');
        this.schedulePanel = page.getByRole('heading', { name: 'This week', exact: true }).locator('..');
    }

    async goto() {
        await this.page.goto('/client/workouts');
    }

    exerciseCheckbox(exerciseName: string): Locator {
        return this.page.getByRole('checkbox', { name: new RegExp(`Mark ${exerciseName} complete`, 'i') });
    }
}
