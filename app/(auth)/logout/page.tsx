import { redirect } from 'next/navigation';

import { clearSession } from '@/lib/auth/session';

/**
 * Logout page — clears the httpOnly session cookie and sends the user to login.
 * Used by Admin / Trainer / Client Profile options → Sign out.
 * No backend logout endpoint (session is cookie-only on the web app).
 */
export default async function LogoutPage(): Promise<never> {
    await clearSession();
    redirect('/login');
}
