export type AdminNavIcon = 'home' | 'renewals' | 'leads' | 'members' | 'attendance' | 'plans' | 'settings';

export type AdminNavItem = {
    href: string;
    label: string;
    icon: AdminNavIcon;
};

export type AdminShellMode = 'settings-only' | 'full';

const ALL_ADMIN_NAV: ReadonlyArray<AdminNavItem> = [
    { href: '/admin', label: 'Dashboard', icon: 'home' },
    { href: '/admin/renewals', label: 'Renewals', icon: 'renewals' },
    { href: '/admin/crm', label: 'Leads', icon: 'leads' },
    { href: '/admin/members', label: 'Members', icon: 'members' },
    { href: '/admin/attendance', label: 'Attendance', icon: 'attendance' },
    { href: '/admin/plans', label: 'Plans', icon: 'plans' },
    { href: '/admin/settings', label: 'Settings', icon: 'settings' },
];

/**
 * First-run Staff (no GymOrg) see Settings only; affiliated Staff get full nav.
 */
export function adminNavItems(mode: AdminShellMode): ReadonlyArray<AdminNavItem> {
    if (mode === 'settings-only') {
        return ALL_ADMIN_NAV.filter((item) => item.href === '/admin/settings');
    }
    return ALL_ADMIN_NAV;
}

export function resolveAdminHomeHref(mode: AdminShellMode): string {
    return mode === 'settings-only' ? '/admin/settings' : '/admin';
}
