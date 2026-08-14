import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getSession, isStaffSession } from '@/lib/auth/session';
import { listStaffGymOrgs } from '@/modules/gym-orgs/list-staff-gym-orgs';

/**
 * Ops modules (dashboard, renewals, …) require at least one GymOrg.
 * Settings stays outside this group for first-run Staff.
 */
export default async function AdminOpsLayout({ children }: { children: ReactNode }) {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        redirect('/login');
    }

    try {
        const gymOrgs = await listStaffGymOrgs(session.accessToken);
        if (gymOrgs.length === 0) {
            redirect('/admin/settings');
        }
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        // List failures: stay on ops so network errors do not force Settings loop.
    }

    return children;
}
