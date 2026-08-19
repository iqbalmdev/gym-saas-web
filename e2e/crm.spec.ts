import { expect, test } from './fixtures/pages.fixture';

test.describe('CRM leads', () => {
    test('Admin can capture a lead, change its status, and delete it', async ({ staffAdmin, crmPage, page }) => {
        await staffAdmin.moduleLink('Leads').click();
        await expect(page).toHaveURL(/\/admin\/crm/);
        await expect(crmPage.heading).toBeVisible();
        await expect(crmPage.pipelineHeading).toBeVisible();

        // Uses a test-only name/phone so this never touches the seeded
        // "Walk-in Prospect" lead other runs may assert on.
        const name = 'E2E Capture Lead';
        const rowCountBefore = await crmPage.pipelineRows.count();
        await crmPage.captureLead(name, '9998887770');

        // `newestRow` is a positional (first-row) locator, re-resolved on
        // every query — it's pinned to our lead only as long as nothing
        // reorders the list, which holds for the rest of this test (status
        // changes and deletes don't reorder).
        const row = crmPage.newestRow;
        await expect(crmPage.rowNameInput(row)).toHaveValue(name);

        // Status change reflects immediately (useOptimistic) — no page
        // reload needed for the Select trigger to show the new label.
        await crmPage.setStatus(row, 'Contacted');
        await expect(row.getByRole('combobox')).toContainText('Contacted');

        // Delete removes the row immediately (useOptimistic) rather than
        // waiting on a full-page refresh.
        await crmPage.deleteButton(row).click();
        await expect(crmPage.pipelineRows).toHaveCount(rowCountBefore);
    });
});
