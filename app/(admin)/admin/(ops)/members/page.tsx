import { MembersAdminPanel } from "@/components/admin/members-admin-panel";
import { createAppServices } from "@/lib/api/composition";
import { ApiClientError } from "@/lib/api/errors";
import { getSession, isStaffSession } from "@/lib/auth/session";
import { membershipInviteErrorMessage } from "@/lib/display/membership-invite-errors";
import { listStaffGymOrgs } from "@/lib/features/gym-orgs/list-staff-gym-orgs";
import type { MembershipInvite } from "@/lib/ports/membership-invites";
import type { MembershipPlan } from "@/lib/ports/plans";

export default async function MembersPage() {
  const session = await getSession();
  if (!session || !isStaffSession(session)) {
    return null;
  }

  const gymOrgs = await listStaffGymOrgs(session.accessToken);
  const gym = gymOrgs[0];
  if (!gym) {
    return null;
  }

  let invites: MembershipInvite[] = [];
  let basePlans: MembershipPlan[] = [];
  let addonPlans: MembershipPlan[] = [];
  let listError: string | null = null;

  try {
    const { listMembershipInvites, listPlans } = createAppServices();
    const [invitePage, basePage, addonPage] = await Promise.all([
      listMembershipInvites({
        accessToken: session.accessToken,
        gymOrgId: gym.id,
      }),
      listPlans({
        accessToken: session.accessToken,
        gymOrgId: gym.id,
        kind: "BASE",
        active: true,
      }),
      listPlans({
        accessToken: session.accessToken,
        gymOrgId: gym.id,
        kind: "ADDON",
        active: true,
      }),
    ]);
    invites = invitePage.membershipInvites.items;
    basePlans = basePage.plans.items;
    addonPlans = addonPage.plans.items;
  } catch (error) {
    listError =
      error instanceof ApiClientError
        ? membershipInviteErrorMessage(error.code, error.message)
        : membershipInviteErrorMessage("NETWORK_OR_UNKNOWN");
  }

  return (
    <MembersAdminPanel
      gymName={gym.name}
      invites={invites}
      basePlans={basePlans}
      addonPlans={addonPlans}
      listError={listError}
    />
  );
}
