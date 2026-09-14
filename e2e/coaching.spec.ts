import { expect, test } from './fixtures/pages.fixture';

test.describe('Coaching', () => {
    test('CLIENT reads diet plan and marks Idli eaten', async ({ clientDiet }) => {
        await expect(clientDiet.heading).toBeVisible();
        await expect(clientDiet.page).toHaveURL(/\/client\/diet/);
        await expect(clientDiet.planPanel.getByText('Cut week')).toBeVisible();

        const checkbox = clientDiet.dietItemCheckbox('Idli');
        await expect(checkbox).toBeVisible();
        await expect(checkbox).not.toBeChecked();

        await checkbox.click();
        await expect(checkbox).toBeChecked();
        await expect(clientDiet.planPanel.getByText('Logged')).toBeVisible();
    });

    test('CLIENT reads workout streak and completes an exercise', async ({ clientWorkouts }) => {
        await expect(clientWorkouts.heading).toBeVisible();
        await expect(clientWorkouts.page).toHaveURL(/\/client\/workouts/);
        await expect(clientWorkouts.streakPanel.getByText('3 days')).toBeVisible();
        await expect(clientWorkouts.schedulePanel.getByText('Push A')).toBeVisible();

        const checkbox = clientWorkouts.exerciseCheckbox('Bench Press');
        await expect(checkbox).not.toBeChecked();
        await checkbox.click();
        await expect(checkbox).toBeChecked();
        await expect(clientWorkouts.schedulePanel.getByText('Day complete')).toBeVisible();
    });
});
