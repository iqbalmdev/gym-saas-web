import type { Locator, Page } from '@playwright/test';

export class MembersPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly rosterHeading: Locator;
    readonly blockCheckInButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Members', exact: true });
        this.rosterHeading = page.getByRole('heading', {
            name: 'Active roster',
            exact: true,
        });
        this.blockCheckInButton = page.getByRole('button', {
            name: 'Block check-in',
        });
    }

    async goto() {
        await this.page.goto('/admin/members');
    }

    memberRow(name: string): Locator {
        return this.page.getByRole('row').filter({ hasText: name });
    }

    /**
     * Trainer `Select` is a Base UI combobox (role="combobox" trigger + a
     * portalled role="listbox"). The option click is scoped to the page.
     */
    async assignTrainer(memberName: string, trainerName: string) {
        const row = this.memberRow(memberName);
        await row.getByRole('combobox', { name: `Assign trainer for ${memberName}` }).click();
        await this.page.getByRole('option', { name: trainerName, exact: true }).click();
    }

    profileLink(memberName: string): Locator {
        return this.memberRow(memberName).getByRole('link', { name: 'Profile' });
    }
}
