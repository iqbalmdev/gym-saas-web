import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { getSession, isClientSession } from "@/lib/auth/session";
import { signOutAction } from "@/lib/modules/auth/auth-actions";

export default async function ClientSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session || !isClientSession(session)) {
    redirect("/login");
  }

  const displayName = session.name ?? session.email;

  return (
    <div className="admin-shell min-h-screen text-[var(--color-fg)]">
      <header className="border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/90 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-xs font-bold text-[var(--color-accent-fg)]">
              G
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                Gym SaaS
              </p>
              <p className="hidden truncate text-xs text-[var(--color-fg-muted)] sm:block">
                {displayName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
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
