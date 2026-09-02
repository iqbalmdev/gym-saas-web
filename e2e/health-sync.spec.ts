import { expect, test } from './fixtures/pages.fixture';

/**
 * Fixture state is process-wide and the suite runs fully parallel, so the
 * mutation test round-trips Samsung Health and leaves the seeded Health Connect
 * connection alone for the read-only test.
 */
test.describe('Health sync', () => {
    test('CLIENT sees a connected app and synced metrics', async ({ clientHealth }) => {
        await expect(clientHealth.heading).toBeVisible();
        await expect(clientHealth.connectionsHeading).toBeVisible();
        await expect(clientHealth.metricsHeading).toBeVisible();
        await expect(clientHealth.page).toHaveURL(/\/client\/health/);

        await expect(clientHealth.connectionRow('Health Connect')).toBeVisible();
        await expect(clientHealth.page.getByText('8,420 steps')).toBeVisible();
        await expect(clientHealth.page.getByText('72.3 kg')).toBeVisible();
    });

    test('CLIENT can connect and disconnect a health app', async ({ clientHealth }) => {
        await clientHealth.chooseProvider('Samsung Health');
        await clientHealth.connectButton.click();

        const row = clientHealth.connectionRow('Samsung Health');
        await expect(row).toBeVisible();
        await expect(row.getByText('Never synced')).toBeVisible();

        await clientHealth.disconnectButton('Samsung Health').click();
        await expect(clientHealth.connectionRow('Samsung Health')).toHaveCount(0);
    });

    test('Admin sees not-shared health sync for a member without the WEARABLES grant', async ({
        staffAdmin,
        membersPage,
        page,
    }) => {
        await staffAdmin.moduleLink('Members').click();
        await expect(page.getByText('Ada Client')).toBeVisible();
        await membersPage.profileLink('Ada Client').click();
        await expect(page).toHaveURL(/\/admin\/members\/e2e-client-roster-1/);
        await expect(page.getByText('Member has not shared wearable metrics with this gym.')).toBeVisible();
    });
});
