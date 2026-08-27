'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

import {
    CLIENT_NAV_ICONS,
    clientNavItems,
    isClientNavItemActive,
    type ClientNavItem,
} from '@/components/client/client-nav';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';

function ClientNavLink({ item }: { item: ClientNavItem }): ReactElement {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();
    const Icon = CLIENT_NAV_ICONS[item.icon];
    const active = isClientNavItemActive(pathname, item);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={active}
                tooltip={item.label}
                // Bigger than the shadcn default (h-8/text-sm) — matches Admin sidebar.
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

export function ClientSidebar(): ReactElement {
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <Sidebar collapsible="icon" aria-label="Member modules" role="complementary">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            tooltip="Gym SaaS"
                            render={
                                <Link
                                    href="/client"
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
                                <span className="block truncate text-xs text-sidebar-foreground/70">Member</span>
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {clientNavItems().map((item) => (
                                <ClientNavLink key={item.href} item={item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}
