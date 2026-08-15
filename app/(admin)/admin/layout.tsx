import Link from 'next/link';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminShell } from '@/components/admin/admin-shell';
import { getSession, isStaffSession } from '@/lib/auth/session';
import type { AdminShellMode } from '@/components/admin/admin-nav';
import { listStaffGymOrgs } from '@/modules/gym-orgs/list-staff-gym-orgs';

function initialsFrom(name: string | null, email: string): string {
    const source = (name?.trim() || email).trim();
    const parts = source.split(/[\s@._-]+/).filter(Boolean);
    if (parts.length === 0) {
        return 'G';
    }
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export default async function AdminSectionLayout({ children }: { children: ReactNode }) {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        redirect('/login');
    }

    let mode: AdminShellMode = 'full';
    let gymName: string | null = null;
    try {
        const gymOrgs = await listStaffGymOrgs(session.accessToken);
        mode = gymOrgs.length === 0 ? 'settings-only' : 'full';
        gymName = gymOrgs[0]?.name ?? null;
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        // List/network failures: keep full shell so ops pages remain reachable.
        mode = 'full';
    }

    const sidebarStateCookie = (await cookies()).get('sidebar_state')?.value;
    const defaultSidebarOpen = sidebarStateCookie !== 'false';

    const displayName = session.name ?? session.email;
    const setupBanner =
        mode === 'settings-only' ? (
            <div className="mb-6 rounded-(--radius-panel) border border-(--color-border)/80 bg-(--color-surface) p-4 text-sm text-(--color-fg-muted) shadow-(--shadow-panel)">
                Create your gym or accept a staff invite on this page
                {session.staffCode ? (
                    <>
                        {' '}
                        · your staff code is <span className="font-medium text-(--color-fg)">{session.staffCode}</span>
                    </>
                ) : null}
                .
            </div>
        ) : session.roleCode === 'STAFF_UNASSIGNED' ? (
            <div className="mb-6 rounded-(--radius-panel) border border-(--color-border)/80 bg-(--color-surface) p-4 text-sm text-(--color-fg-muted) shadow-(--shadow-panel)">
                Your staff account is ready
                {session.staffCode ? ` · ${session.staffCode}` : ''}. Invite Trainers from{' '}
                <Link
                    href="/admin/settings"
                    className="font-medium text-(--color-fg) underline-offset-2 hover:underline"
                >
                    Settings
                </Link>{' '}
                once you are an Admin, or accept an invite if you were invited.
            </div>
        ) : null;

    return (
        <AdminShell
            mode={mode}
            gymName={gymName}
            defaultSidebarOpen={defaultSidebarOpen}
            user={{
                displayName,
                email: session.email,
                roleCode: session.roleCode,
                staffCode: session.staffCode,
                initials: initialsFrom(session.name, session.email),
            }}
            setupBanner={setupBanner}
        >
            {children}
        </AdminShell>
    );
}
