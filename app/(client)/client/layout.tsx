import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { getSession, isClientSession } from "@/lib/auth/session";
import { signOutAction } from "@/lib/features/auth/actions";

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
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <p className="text-sm font-semibold tracking-tight">Gym SaaS</p>
          <p className="hidden text-xs text-[var(--color-fg-muted)] sm:block">
            {displayName}
          </p>
          <div className="ml-auto flex items-center gap-2">
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
