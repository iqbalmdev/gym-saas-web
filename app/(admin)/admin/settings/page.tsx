import { Suspense } from 'react';

import { getSession, isStaffSession } from '@/lib/auth/session';
import { SettingsData } from '@/modules/staff-invites/components/settings-data';
import { SettingsPageSkeleton } from '@/modules/staff-invites/components/settings-page-skeleton';

export default async function SettingsPage() {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        return null;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg) md:text-3xl">Settings</h1>

            <Suspense fallback={<SettingsPageSkeleton />}>
                <SettingsData session={session} />
            </Suspense>
        </div>
    );
}
