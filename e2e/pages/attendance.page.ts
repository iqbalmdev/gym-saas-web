import type { Locator, Page } from '@playwright/test';

export class AttendancePage {
    readonly page: Page;
    readonly heading: Locator;
    readonly deskMarkHeading: Locator;
    readonly memberSelect: Locator;
    readonly markButton: Locator;
    readonly todayHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', {
            name: 'Attendance',
            exact: true,
        });
        this.deskMarkHeading = page.getByRole('heading', {
            name: 'Desk mark',
            exact: true,
        });
        this.memberSelect = page.getByLabel('Member', { exact: true });
        this.markButton = page.getByRole('button', { name: 'Mark attendance' });
        this.todayHeading = page.getByRole('heading', {
            name: "Today's attendance",
            exact: true,
        });
    }

    async goto() {
        await this.page.goto('/admin/attendance');
    }

    /**
     * `memberSelect` is a Base UI `Select` (role="combobox" trigger + a
     * portalled role="listbox" popup) — not a native `<select>`, so callers
     * open it and target the matching `role="option"` rather than using
     * `selectOption()`.
     */
    memberOption(name: string): Locator {
        return this.page.getByRole('option', { name });
    }

    async selectMember(name: string) {
        await this.memberSelect.click();
        await this.memberOption(name).click();
    }
}
