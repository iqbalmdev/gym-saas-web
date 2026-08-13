import { DataGrantsPanel } from "@/components/client/data-grants-panel";
import { MembershipInviteInbox } from "@/components/client/membership-invite-inbox";
import { createAppServices } from "@/lib/api/composition";
import { ApiClientError } from "@/lib/api/errors";
import { getSession, isClientSession } from "@/lib/auth/session";
import { membershipInviteErrorMessage } from "@/lib/display/membership-invite-errors";
import type {
  MembershipInvite,
  MyDataGrants,
} from "@/lib/ports/membership-invites";

type LoadedGrants = {
  gymOrgId: string;
  gymName?: string;
  dataGrants: MyDataGrants;
};

export default async function ClientHomePage() {
  const session = await getSession();
  if (!session || !isClientSession(session)) {
    return null;
  }

  let invites: MembershipInvite[] = [];
  let listError: string | null = null;
  const grantsPanels: LoadedGrants[] = [];

  try {
    const { listMembershipInviteInbox, getMyDataGrants } = createAppServices();
    const { membershipInvites } = await listMembershipInviteInbox({
      accessToken: session.accessToken,
    });
    invites = membershipInvites.items;

    const gymCandidates = new Map<string, string | undefined>();
    for (const invite of invites) {
      if (invite.gymOrgId) {
        gymCandidates.set(invite.gymOrgId, invite.gym?.name);
      }
    }

    for (const [gymOrgId, gymName] of gymCandidates) {
      try {
        const { dataGrants } = await getMyDataGrants({
          accessToken: session.accessToken,
          gymOrgId,
        });
        grantsPanels.push({ gymOrgId, gymName, dataGrants });
      } catch (error) {
        // 404 = no ACTIVE membership for that gym — hide panel.
        if (
          error instanceof ApiClientError &&
          (error.status === 404 || error.code === "NOT_FOUND")
        ) {
          continue;
        }
        // Other errors: skip quietly so invite inbox still works.
      }
    }
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
      {grantsPanels.map((panel) => (
        <DataGrantsPanel
          key={panel.gymOrgId}
          gymOrgId={panel.gymOrgId}
          gymName={panel.gymName}
          dataGrants={panel.dataGrants}
        />
      ))}
    </div>
  );
}
