'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    ADMIN_NAV_ICONS,
    adminNavItems,
    isAdminNavItemActive,
    resolveAdminHomeHref,
    type AdminNavItem,
    type AdminShellMode,
} from '@/components/admin/admin-nav';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';

function AdminNavLink({ item }: { item: AdminNavItem }) {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();
    const Icon = ADMIN_NAV_ICONS[item.icon];
    const active = isAdminNavItemActive(pathname, item);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={active}
                tooltip={item.label}
                // Bigger than the shadcn default (h-8/text-sm) — the default reads cramped
                // for a staff-facing nav that's on screen all day.
                className="h-10 gap-3 text-[0.9375rem]"
                render={
                    <Link
                        href={item.href}
                        onClick={() => {
                            if (isMobile) {
                                setOpenMobile(false);
                            }
                        }}
                    />
                }
            >
                <Icon />
                <span>{item.label}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

type AppSidebarProps = {
    mode: AdminShellMode;
    gymName: string | null;
};

export function AppSidebar({ mode, gymName }: AppSidebarProps) {
    const { isMobile, setOpenMobile } = useSidebar();
    const homeHref = resolveAdminHomeHref(mode);

    return (
        <Sidebar collapsible="icon" aria-label="Admin modules" role="complementary">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            tooltip="Gym SaaS"
                            render={
                                <Link
                                    href={homeHref}
                                    onClick={() => {
                                        if (isMobile) {
                                            setOpenMobile(false);
                                        }
                                    }}
                                />
                            }
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                                G
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-[0.9375rem] font-semibold tracking-tight">
                                    Gym SaaS
                                </span>
                                {gymName ? (
                                    <span className="block truncate text-xs text-sidebar-foreground/70">{gymName}</span>
                                ) : null}
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {adminNavItems(mode).map((item) => (
                                <AdminNavLink key={item.href} item={item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div className="flex items-center justify-between gap-2 px-1 group-data-[collapsible=icon]:justify-center">
                    <span className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                        Appearance
                    </span>
                    <ThemeToggle />
                </div>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
