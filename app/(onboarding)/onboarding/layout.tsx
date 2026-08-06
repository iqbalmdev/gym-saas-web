import Link from "next/link";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { createAppServices } from "@/lib/api/composition";
import { getSession, isStaffSession } from "@/lib/auth/session";
import { signOutAction } from "@/lib/features/auth/actions";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session || !isStaffSession(session)) {
    redirect("/login");
  }

  try {
    const { listGymOrgs } = createAppServices();
    const { gymOrgs } = await listGymOrgs({ accessToken: session.accessToken });
    if (gymOrgs.length > 0) {
      redirect("/admin");
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    // Stay on onboarding if list fails — create form can still run.
  }

  return (
    <div className="admin-shell min-h-screen text-[var(--color-fg)]">
      <header className="border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/90 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link href="/onboarding/create-gym" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-accent)] text-xs font-bold text-[var(--color-accent-fg)]">
              G
            </span>
            <span className="text-sm font-semibold tracking-tight">Gym SaaS</span>
          </Link>
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
      <main className="mx-auto max-w-lg px-4 py-8">{children}</main>
    </div>
  );
}
