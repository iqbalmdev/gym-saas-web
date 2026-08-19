import type { Locator, Page } from '@playwright/test';

export class CrmPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly captureForm: Locator;
    readonly nameInput: Locator;
    readonly phoneInput: Locator;
    readonly createButton: Locator;
    readonly pipelineHeading: Locator;
    /**
     * Pipeline rows only — the separate "Due follow-ups" list above renders
     * plain-text `<li>`s with no form controls, so filtering for a status
     * combobox unambiguously excludes it without depending on container
     * nesting.
     */
    readonly pipelineRows: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Leads', exact: true });
        // Scoped to the capture form: each pipeline row below also has
        // Name/Phone fields (inline edit), so an unscoped getByLabel would
        // match more than one element.
        this.captureForm = page.locator('form', {
            has: page.getByRole('heading', { name: 'Capture lead', exact: true }),
        });
        this.nameInput = this.captureForm.getByLabel('Name', { exact: true });
        this.phoneInput = this.captureForm.getByLabel('Phone', { exact: true });
        this.createButton = this.captureForm.getByRole('button', { name: 'Create lead' });
        this.pipelineHeading = page.getByRole('heading', { name: /Pipeline for/ });
        this.pipelineRows = page.getByRole('listitem').filter({ has: page.getByRole('combobox') });
    }

    async goto() {
        await this.page.goto('/admin/crm');
    }

    async captureLead(name: string, phone: string) {
        await this.nameInput.fill(name);
        await this.phoneInput.fill(phone);
        await this.createButton.click();
    }

    /** Newly created leads are prepended, so the freshly captured lead is always the first pipeline row. */
    get newestRow(): Locator {
        return this.pipelineRows.first();
    }

    rowNameInput(row: Locator): Locator {
        return row.getByLabel('Name', { exact: true });
    }

    /**
     * Status `Select` is a Base UI combobox (role="combobox" trigger + a
     * portalled role="listbox" popup) — the trigger lives in the row, but
     * the popup renders into a portal outside it, so the option click is
     * scoped to the page, not the row.
     */
    async setStatus(row: Locator, statusLabel: string) {
        await row.getByRole('combobox').click();
        await this.page.getByRole('option', { name: statusLabel, exact: true }).click();
    }

    deleteButton(row: Locator): Locator {
        return row.getByRole('button', { name: 'Delete' });
    }
}
