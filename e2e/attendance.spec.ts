import { expect, test } from './fixtures/pages.fixture';

test.describe('Attendance desk', () => {
    test("Admin can desk-mark and see today's list", async ({ staffAdmin, attendancePage, page }) => {
        await staffAdmin.moduleLink('Attendance').click();
        await expect(page).toHaveURL(/\/admin\/attendance/);
        await expect(attendancePage.heading).toBeVisible();
        await expect(attendancePage.deskMarkHeading).toBeVisible();
        await expect(attendancePage.memberSelect).toBeVisible();

        const adaOption = attendancePage.memberSelect.locator('option', {
            hasText: 'Ada Client',
        });
        await expect(adaOption).toHaveCount(1);
        const adaValue = await adaOption.getAttribute('value');
        expect(adaValue).toBeTruthy();
        await attendancePage.memberSelect.selectOption(adaValue!);

        await attendancePage.markButton.click();
        await expect(attendancePage.todayHeading).toBeVisible();
        await expect(page.getByRole('listitem').filter({ hasText: 'Ada Client' })).toBeVisible();
        await expect(page.getByRole('listitem').filter({ hasText: /Desk/i })).toBeVisible();
    });
});
