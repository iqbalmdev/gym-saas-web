import type { Locator, Page } from '@playwright/test';

export class SettingsPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly createGymHeading: Locator;
    readonly gymName: Locator;
    readonly createGymButton: Locator;
    readonly inviteInboxHeading: Locator;
    readonly acceptInviteButton: Locator;
    readonly staffInvitesHeading: Locator;
    readonly staffCodeInput: Locator;
    readonly roleSelect: Locator;
    readonly sendInviteButton: Locator;
    readonly revokeButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Settings' });
        this.createGymHeading = page.getByRole('heading', {
            name: 'Create your gym',
        });
        this.gymName = page.getByLabel('Gym name');
        this.createGymButton = page.getByRole('button', { name: 'Create gym' });
        this.inviteInboxHeading = page.getByRole('heading', {
            name: 'Your staff invites',
        });
        this.acceptInviteButton = page.getByRole('button', { name: 'Accept' });
        this.staffInvitesHeading = page.locator('#staff-invites-heading');
        this.staffCodeInput = page.getByLabel('Staff code');
        this.roleSelect = page.getByRole('combobox', { name: 'Role' });
        this.sendInviteButton = page.getByRole('button', { name: 'Send invite' });
        this.revokeButton = page.getByRole('button', { name: 'Revoke' }).first();
    }

    async goto() {
        await this.page.goto('/admin/settings');
    }

    /**
     * `roleSelect` is a Base UI `Select` (role="combobox" trigger + a
     * portalled role="listbox" popup) — not a native `<select>`, so this
     * opens it and clicks the matching `role="option"` rather than
     * `selectOption()`.
     */
    async selectRole(name: string) {
        await this.roleSelect.click();
        await this.page.getByRole('option', { name, exact: true }).click();
    }
}
