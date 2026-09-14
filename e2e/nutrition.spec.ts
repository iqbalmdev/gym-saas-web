import { expect, test } from './fixtures/pages.fixture';

/**
 * Fixture state is process-wide and the suite runs fully parallel, so the one
 * seeded diary line is read and removed inside a single test rather than split
 * across two that would race for it.
 */
test.describe('Nutrition', () => {
    test.describe.configure({ mode: 'serial' });

    test("CLIENT reads today's diary and removes an extra line", async ({ clientNutrition }) => {
        await expect(clientNutrition.heading).toBeVisible();
        await expect(clientNutrition.diary).toBeVisible();
        await expect(clientNutrition.catalog).toBeVisible();
        await expect(clientNutrition.page).toHaveURL(/\/client\/nutrition/);

        // Seeded: 2 idlis at breakfast, snapshotted at 81 kcal.
        const row = clientNutrition.diaryRow('Idli');
        await expect(row).toBeVisible();
        await expect(row).toContainText('Idli × 2');
        await expect(clientNutrition.diary.getByText('81 kcal').first()).toBeVisible();

        await clientNutrition.removeButton('Idli', 'Breakfast').click();

        await expect(clientNutrition.diaryRow('Idli')).toHaveCount(0);
        await expect(clientNutrition.diary.getByText('Nothing logged.').first()).toBeVisible();
    });

    test('CLIENT searches the food catalog and logs an extra', async ({ clientNutrition }) => {
        await expect(clientNutrition.catalogRow('Chapati')).toBeVisible();

        await clientNutrition.foodSearchInput.fill('chap');

        await expect(clientNutrition.catalogRow('Chapati')).toBeVisible();
        await expect(clientNutrition.catalogRow('Idli')).toHaveCount(0);

        await clientNutrition.logButton('Chapati', 'Breakfast').click();

        await expect(clientNutrition.diaryRow('Chapati')).toBeVisible();
    });

    test('Admin sees not-shared diary for a member without the CALORIES grant', async ({
        staffAdmin,
        membersPage,
        page,
    }) => {
        await staffAdmin.moduleLink('Members').click();
        await expect(membersPage.memberRow('Ada Client')).toBeVisible();
        await membersPage.select('Ada Client');
        await membersPage.profileLink().click();
        await expect(page).toHaveURL(/\/admin\/members\/e2e-client-roster-1/);
        // Ada has a seeded diary, so this proves the grant gate rather than an empty day.
        await expect(page.getByText('Member has not shared their food diary with this gym.')).toBeVisible();
    });

    test('Admin sees shared diary for a member with the CALORIES grant', async ({ staffAdmin, membersPage, page }) => {
        await staffAdmin.moduleLink('Members').click();
        await expect(membersPage.memberRow('Rahul Menon')).toBeVisible();
        await membersPage.select('Rahul Menon');
        await membersPage.profileLink().click();
        await expect(page).toHaveURL(/\/admin\/members\/e2e-client-roster-2/);
        await expect(page.getByRole('heading', { name: 'Food diary', exact: true })).toBeVisible();
        await expect(page.getByText('Chapati × 2')).toBeVisible();
        await expect(page.getByText('238 kcal').first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Remove Chapati/ })).toHaveCount(0);
    });
});
