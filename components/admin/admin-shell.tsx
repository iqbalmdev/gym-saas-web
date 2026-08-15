'use client';

import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';

import { AppSidebar } from '@/components/admin/app-sidebar';
import { getActiveAdminNavItem, type AdminShellMode } from '@/components/admin/admin-nav';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { signOutAction } from '@/modules/auth/auth-actions';

export type AdminShellUser = {
    displayName: string;
    email: string;
    roleCode: string;
    staffCode: string | null;
    initials: string;
};

type AdminShellProps = {
    children: ReactNode;
    user: AdminShellUser;
    mode?: AdminShellMode;
    /** Active GymOrg name when Staff is affiliated. */
    gymName?: string | null;
    setupBanner?: ReactNode;
    /** SSR-known sidebar open state, read from the `sidebar_state` cookie. */
    defaultSidebarOpen?: boolean;
};

export function AdminShell({
    children,
    user,
    mode = 'full',
    gymName = null,
    setupBanner,
    defaultSidebarOpen = true,
}: AdminShellProps) {
    const pathname = usePathname();
    const pageLabel = useMemo(() => getActiveAdminNavItem(pathname, mode)?.label, [pathname, mode]);

    return (
        // Without a Provider, collapsed-rail tooltips fall back to base-ui's 600ms open
        // delay — feels like they don't work at all. Group them with a snappy delay instead.
        <TooltipProvider delay={150}>
            <SidebarProvider defaultOpen={defaultSidebarOpen} className="admin-shell">
                <AppSidebar mode={mode} gymName={gymName} />
                <SidebarInset className="flex min-h-svh min-w-0 flex-col bg-transparent">
                    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-(--color-border)/80 bg-(--color-surface)/90 px-4 backdrop-blur-md sm:px-6">
                        <SidebarTrigger />
                        <Separator
                            orientation="vertical"
                            className="mr-1 hidden h-6 sm:block data-vertical:self-center"
                        />
                        {/* Not an <h1> — each page renders its own primary heading; this is chrome, not content. */}
                        <p className="min-w-0 truncate text-sm font-medium text-(--color-fg)">{pageLabel}</p>

                        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                            <ThemeToggle />
                            <div className="hidden text-right sm:block">
                                <p className="text-sm leading-tight font-medium">{user.displayName}</p>
                                <p className="text-xs text-(--color-fg-muted)">{user.roleCode}</p>
                            </div>
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-canvas-accent) text-xs font-semibold text-(--color-fg) ring-2 ring-(--color-surface)"
                                title={user.email}
                                aria-label={user.displayName}
                            >
                                {user.initials}
                            </div>
                            <form action={signOutAction}>
                                <Button type="submit" variant="ghost" className="text-xs">
                                    Sign out
                                </Button>
                            </form>
                        </div>
                    </header>

                    <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 md:px-8 md:py-8">
                        {setupBanner}
                        <div className="mx-auto max-w-6xl">{children}</div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}
