import type { Locator, Page } from '@playwright/test';

export class AdminShellPage {
    readonly page: Page;
    readonly sidebar: Locator;
    readonly operationsHeading: Locator;
    /** The header's shadcn `SidebarTrigger` — one toggle for collapse/expand (desktop) and open/close (mobile). */
    readonly sidebarTrigger: Locator;

    constructor(page: Page) {
        this.page = page;
        this.sidebar = page.getByRole('complementary', { name: 'Admin modules' });
        this.operationsHeading = page.getByRole('heading', { name: 'Operations' });
        // Scoped to <header>: the sidebar's own edge rail carries the same accessible name.
        this.sidebarTrigger = page.locator('header').getByRole('button', { name: 'Toggle Sidebar' });
    }

    async gotoDashboard() {
        await this.page.goto('/admin');
    }

    /** Desktop-only: the mobile drawer is a modal Sheet, not the `complementary` landmark this scopes to. */
    moduleLink(name: string): Locator {
        return this.sidebar.getByRole('link', { name, exact: true });
    }

    /** shadcn's `Sidebar` exposes collapsed/expanded via `data-state` on the desktop `data-slot="sidebar"` div. */
    async sidebarState(): Promise<'expanded' | 'collapsed'> {
        const state = await this.page.locator('[data-slot="sidebar"]').getAttribute('data-state');
        return state === 'collapsed' ? 'collapsed' : 'expanded';
    }

    async expectShellReady() {
        await this.sidebar.waitFor({ state: 'visible' });
        await this.operationsHeading.waitFor({ state: 'visible' });
    }
}
