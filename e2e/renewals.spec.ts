import { expect, test } from './fixtures/pages.fixture';

test.describe('Renewals', () => {
    test('Admin sees renewals due list', async ({ staffAdmin, renewalsPage, page }) => {
        await staffAdmin.moduleLink('Renewals').click();
        await expect(page).toHaveURL(/\/admin\/renewals/);
        await expect(renewalsPage.heading).toBeVisible();
        await expect(renewalsPage.renewalsDueHeading).toBeVisible();
        await expect(page.getByText(/BASE · ends/i).first()).toBeVisible();
        await expect(page.getByText(/Unpaid/i).first()).toBeVisible();
    });
});
