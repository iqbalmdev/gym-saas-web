import type { Locator, Page } from '@playwright/test';

export class ClientHealthPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly connectionsHeading: Locator;
    readonly metricsHeading: Locator;
    readonly providerSelect: Locator;
    readonly connectButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Health Sync', exact: true });
        this.connectionsHeading = page.getByRole('heading', { name: 'Connected apps', exact: true });
        this.metricsHeading = page.getByRole('heading', { name: 'Synced metrics', exact: true });
        this.providerSelect = page.getByRole('combobox', { name: 'Add a health app' });
        this.connectButton = page.getByRole('button', { name: 'Connect', exact: true });
    }

    async goto() {
        await this.page.goto('/client/health');
    }

    connectionRow(providerLabel: string): Locator {
        return this.page.getByRole('listitem').filter({ hasText: providerLabel });
    }

    disconnectButton(providerLabel: string): Locator {
        return this.page.getByRole('button', { name: `Disconnect ${providerLabel}` });
    }

    /**
     * Provider `Select` is a Base UI combobox (role="combobox" trigger + a
     * portalled role="listbox"), so the option click is scoped to the page.
     */
    async chooseProvider(providerLabel: string) {
        await this.providerSelect.click();
        await this.page.getByRole('option', { name: providerLabel, exact: true }).click();
    }
}
