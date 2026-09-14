import type { Locator, Page } from '@playwright/test';

export class ClientWorkoutsPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly streakPanel: Locator;
    readonly schedulePanel: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Workouts', exact: true });
        this.streakPanel = page.locator('section[aria-labelledby="workout-streak-heading"]');
        this.schedulePanel = page.locator('section[aria-labelledby="workout-schedule-heading"]');
    }

    async goto() {
        await this.page.goto('/client/workouts');
    }

    exerciseCheckbox(exerciseName: string): Locator {
        return this.schedulePanel.getByRole('listitem').filter({ hasText: exerciseName }).getByRole('checkbox');
    }
}
