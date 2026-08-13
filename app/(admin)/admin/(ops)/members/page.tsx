import { MembersAdminPanel } from "@/lib/modules/membership-invites/components/members-admin-panel";
import { RosterPanel } from "@/lib/modules/roster/components/roster-panel";
import { createAppServices } from "@/lib/api/composition";
import { ApiClientError } from "@/lib/api/errors";
import { getSession, isStaffSession } from "@/lib/auth/session";
import { membershipInviteErrorMessage } from "@/lib/modules/membership-invites/membership-invites-errors";
import { rosterErrorMessage } from "@/lib/modules/roster/roster-errors";
import { listStaffGymOrgs } from "@/lib/modules/gym-orgs/list-staff-gym-orgs";
import type { MembershipInvite } from "@/lib/modules/membership-invites/membership-invites-ports";
import type { MembershipPlan } from "@/lib/modules/plans/plans-ports";
import type { RosterMember } from "@/lib/modules/roster/roster-ports";

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
  let members: RosterMember[] = [];
  let inviteListError: string | null = null;
  let rosterListError: string | null = null;

  try {
    const { listMembershipInvites, listPlans, listRosterMembers } =
      createAppServices();
    const [invitePage, basePage, addonPage, roster] = await Promise.all([
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
      listRosterMembers({
        accessToken: session.accessToken,
        gymOrgId: gym.id,
        status: "ACTIVE",
      }),
    ]);
    invites = invitePage.membershipInvites.items;
    basePlans = basePage.plans.items;
    addonPlans = addonPage.plans.items;
    members = roster.members;
  } catch (error) {
    const message =
      error instanceof ApiClientError
        ? error.code
        : "NETWORK_OR_UNKNOWN";
    inviteListError =
      error instanceof ApiClientError
        ? membershipInviteErrorMessage(error.code, error.message)
        : membershipInviteErrorMessage("NETWORK_OR_UNKNOWN");
    rosterListError = rosterErrorMessage(message);
  }

  return (
    <div className="space-y-8">
      <MembersAdminPanel
        gymName={gym.name}
        invites={invites}
        basePlans={basePlans}
        addonPlans={addonPlans}
        listError={inviteListError}
      />
      <RosterPanel members={members} listError={rosterListError} />
    </div>
  );
}
