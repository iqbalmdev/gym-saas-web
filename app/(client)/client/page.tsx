import { MembershipInviteInbox } from "@/components/client/membership-invite-inbox";
import { createAppServices } from "@/lib/api/composition";
import { ApiClientError } from "@/lib/api/errors";
import { getSession, isClientSession } from "@/lib/auth/session";
import { membershipInviteErrorMessage } from "@/lib/display/membership-invite-errors";
import type { MembershipInvite } from "@/lib/ports/membership-invites";

export default async function ClientHomePage() {
  const session = await getSession();
  if (!session || !isClientSession(session)) {
    return null;
  }

  let invites: MembershipInvite[] = [];
  let listError: string | null = null;

  try {
    const { listMembershipInviteInbox } = createAppServices();
    const { membershipInvites } = await listMembershipInviteInbox({
      accessToken: session.accessToken,
    });
    invites = membershipInvites.items;
  } catch (error) {
    listError =
      error instanceof ApiClientError
        ? membershipInviteErrorMessage(error.code, error.message)
        : membershipInviteErrorMessage("NETWORK_OR_UNKNOWN");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)]">
          Member home
        </h1>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Accept a gym invite to start your membership.
        </p>
      </div>
      <MembershipInviteInbox invites={invites} listError={listError} />
    </div>
  );
}
