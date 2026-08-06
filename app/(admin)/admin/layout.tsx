import Link from "next/link";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { createAppServices } from "@/lib/api/composition";
import { getSession, isStaffSession } from "@/lib/auth/session";

function initialsFrom(name: string | null, email: string): string {
  const source = (name?.trim() || email).trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) {
    return "G";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default async function AdminSectionLayout({
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
    if (gymOrgs.length === 0) {
      redirect("/onboarding/create-gym");
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    // List/network failures must not bounce staff into onboarding (create loop).
  }

  const displayName = session.name ?? session.email;
  const setupBanner =
    session.roleCode === "STAFF_UNASSIGNED" ? (
      <div className="mb-6 rounded-[var(--radius-panel)] border border-[var(--color-border)]/80 bg-[var(--color-surface)] p-4 text-sm text-[var(--color-fg-muted)] shadow-[var(--shadow-panel)]">
        Your staff account is ready
        {session.staffCode ? ` · ${session.staffCode}` : ""}. Finish gym profile
        in{" "}
        <Link
          href="/admin/settings"
          className="font-medium text-[var(--color-fg)] underline-offset-2 hover:underline"
        >
          Settings
        </Link>{" "}
        anytime.
      </div>
    ) : null;

  return (
    <AdminShell
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
