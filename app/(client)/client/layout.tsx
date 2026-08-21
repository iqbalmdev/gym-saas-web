import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { ClientSectionNav } from '@/components/client/client-section-nav';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getSession, isClientSession } from '@/lib/auth/session';
import { signOutAction } from '@/modules/auth/auth-actions';

/**
 * Client chrome: top bar + Home / Profile links. Same header atoms as Admin.
 * Profile and progress live on `/client/profile`, not the home inbox.
 */
export default async function ClientSectionLayout({ children }: { children: ReactNode }) {
    const session = await getSession();
    if (!session || !isClientSession(session)) {
        redirect('/login');
    }

    const displayName = session.name ?? session.email;

    return (
        <div className="admin-shell min-h-svh">
            <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-(--color-border)/80 bg-(--color-surface)/90 px-4 backdrop-blur-md sm:px-6">
                <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--color-accent) text-xs font-bold text-(--color-accent-fg)">
                        G
                    </span>
                    <p className="truncate text-sm font-semibold tracking-tight">Gym SaaS</p>
                    <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block data-vertical:self-center" />
                    <p className="hidden truncate text-xs text-(--color-fg-muted) sm:block">{displayName}</p>
                    <ClientSectionNav />

                    <div className="ml-auto flex shrink-0 items-center gap-2">
                        <ThemeToggle />
                        <form action={signOutAction}>
                            <Button type="submit" variant="ghost" className="text-xs">
                                Sign out
                            </Button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        </div>
    );
}
