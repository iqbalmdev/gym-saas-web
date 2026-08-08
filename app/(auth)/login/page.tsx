import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { createAppServices } from "@/lib/api/composition";
import { getSession } from "@/lib/auth/session";
import { resolvePostAuthPath } from "@/lib/features/auth/resolve-post-auth-path";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    let gymOrgCount = 0;
    if (session.lane === "STAFF") {
      try {
        const { listGymOrgs } = createAppServices();
        const { gymOrgs } = await listGymOrgs({
          accessToken: session.accessToken,
        });
        gymOrgCount = gymOrgs.length;
      } catch {
        gymOrgCount = 0;
      }
    }
    redirect(resolvePostAuthPath({ lane: session.lane, gymOrgCount }));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">
          Gym SaaS
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--color-fg)]">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
          Email code or Google. New accounts choose Staff or Member; returning
          users keep the same type. No separate sign-up.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
