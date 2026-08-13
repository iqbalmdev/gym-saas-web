import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getSession, isStaffSession } from '@/lib/auth/session';

/**
 * Legacy onboarding chrome — all Staff first-run work lives on Settings.
 */
export default async function OnboardingLayout({ children: _children }: { children: ReactNode }) {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        redirect('/login');
    }
    redirect('/admin/settings');
}
