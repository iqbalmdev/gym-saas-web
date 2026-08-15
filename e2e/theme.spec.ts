import { expect, test } from './fixtures/pages.fixture';

test.describe('Theme toggle', () => {
    test('switches data-theme between light and dark on login', async ({ loginPage, page }) => {
        await test.step('Open login with stored light preference', async () => {
            await page.addInitScript(() => {
                localStorage.setItem('gym-saas-theme', 'light');
            });
            await loginPage.goto();
            await expect(page.locator('html')).toHaveAttribute('data-theme-ready', 'true');
            await expect(loginPage.heading).toBeVisible();
            await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
            await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
        });

        await test.step('Toggle to dark', async () => {
            await page.getByRole('button', { name: 'Switch to dark mode' }).click();
            await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
            await expect.poll(() => page.evaluate(() => localStorage.getItem('gym-saas-theme'))).toBe('dark');
        });

        await test.step('Toggle back to light', async () => {
            await page.getByRole('button', { name: 'Switch to light mode' }).click();
            await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        });
    });

    // shadcn keys dark off `.dark` by default; we repointed it at `data-theme`
    // and aliased its tokens onto the CRM palette (ADR-0006). If either breaks,
    // components keep rendering — just with the wrong colours — so assert the
    // computed values rather than trusting the attribute alone.
    test('shadcn tokens resolve and follow data-theme', async ({ loginPage, page }) => {
        const shadcnTokens = () =>
            page.evaluate(() => {
                const s = getComputedStyle(document.documentElement);
                return {
                    background: s.getPropertyValue('--background').trim(),
                    foreground: s.getPropertyValue('--foreground').trim(),
                    primary: s.getPropertyValue('--primary').trim(),
                    border: s.getPropertyValue('--border').trim(),
                };
            });

        await page.addInitScript(() => {
            localStorage.setItem('gym-saas-theme', 'light');
        });
        await loginPage.goto();
        await expect(page.locator('html')).toHaveAttribute('data-theme-ready', 'true');

        const light = await shadcnTokens();
        // Aliases must resolve to a real colour, not an empty string.
        for (const [name, value] of Object.entries(light)) {
            expect(value, `--${name} should resolve in light mode`).not.toBe('');
        }
        // Aliased onto the CRM palette, not shadcn's default neutral oklch ramp.
        expect(light.background).toBe('#eef2f6');
        expect(light.foreground).toBe('#0f172a');

        await page.getByRole('button', { name: 'Switch to dark mode' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

        const dark = await shadcnTokens();
        expect(dark.background).toBe('#0b1220');
        expect(dark.foreground).toBe('#e8eef6');
        // Every token must actually change — a stuck alias is the failure mode.
        expect(dark.primary).not.toBe(light.primary);
        expect(dark.border).not.toBe(light.border);
    });
});
