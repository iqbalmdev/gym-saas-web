import { expect, test } from './fixtures/pages.fixture';

test.describe('Attendance desk', () => {
    test("Admin can desk-mark and see today's list", async ({ staffAdmin, attendancePage, page }) => {
        await staffAdmin.moduleLink('Attendance').click();
        await expect(page).toHaveURL(/\/admin\/attendance/);
        await expect(attendancePage.heading).toBeVisible();
        await expect(attendancePage.deskMarkHeading).toBeVisible();
        await expect(attendancePage.memberSelect).toBeVisible();

        await attendancePage.memberSelect.click();
        const adaOption = attendancePage.memberOption('Ada Client');
        await expect(adaOption).toHaveCount(1);
        await adaOption.click();

        await attendancePage.markButton.click();
        await expect(attendancePage.todayHeading).toBeVisible();
        await expect(page.getByRole('listitem').filter({ hasText: 'Ada Client' })).toBeVisible();
        await expect(page.getByRole('listitem').filter({ hasText: /Desk/i })).toBeVisible();
    });
});
