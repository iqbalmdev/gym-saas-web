import { CreateGymForm } from "@/components/onboarding/create-gym-form";
import { StaffInvitesAdminPanel } from "@/components/admin/staff-invites-admin-panel";
import { StaffInviteInbox } from "@/components/staff/staff-invite-inbox";
import { createAppServices } from "@/lib/api/composition";
import { ApiClientError } from "@/lib/api/errors";
import { getSession, isStaffSession } from "@/lib/auth/session";
import { staffInviteErrorMessage } from "@/lib/display/staff-invite-errors";
import type { StaffInvite } from "@/lib/ports/staff-invites";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || !isStaffSession(session)) {
    return null;
  }

  const { listGymOrgs, listGymStaffInvites, listStaffInviteInbox } =
    createAppServices();
  let gymName = "your gym";
  let gymOrgId: string | null = null;
  let invites: StaffInvite[] = [];
  let inbox: StaffInvite[] = [];
  let listError: string | null = null;
  let inboxError: string | null = null;

  try {
    const { gymOrgs } = await listGymOrgs({ accessToken: session.accessToken });
    const active = gymOrgs[0];
    if (active) {
      gymOrgId = active.id;
      gymName = active.name;
    }
  } catch (error) {
    listError =
      error instanceof ApiClientError
        ? staffInviteErrorMessage(error.code, error.message)
        : staffInviteErrorMessage("NETWORK_OR_UNKNOWN");
  }

  if (gymOrgId) {
    try {
      const { staffInvites } = await listGymStaffInvites({
        accessToken: session.accessToken,
        gymOrgId,
      });
      invites = staffInvites.items;
    } catch (error) {
      listError =
        error instanceof ApiClientError
          ? staffInviteErrorMessage(error.code, error.message)
          : staffInviteErrorMessage("NETWORK_OR_UNKNOWN");
    }
  } else {
    try {
      const { staffInvites } = await listStaffInviteInbox({
        accessToken: session.accessToken,
      });
      inbox = staffInvites.items;
    } catch (error) {
      inboxError =
        error instanceof ApiClientError
          ? staffInviteErrorMessage(error.code, error.message)
          : staffInviteErrorMessage("NETWORK_OR_UNKNOWN");
    }
  }

  const canCreateGym =
    !gymOrgId &&
    (session.roleCode === "STAFF_UNASSIGNED" || session.roleCode === "ADMIN");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)] md:text-3xl">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-fg-muted)]">
          {gymOrgId
            ? `Managing ${gymName}. Invite Trainers and desk Admins with an existing staff code.`
            : "Create your GymOrg to unlock Admin tools, or accept a staff invite if a gym already invited you."}
        </p>
      </div>

      {session.staffCode ? (
        <p className="text-sm text-[var(--color-fg-muted)]">
          Your staff code:{" "}
          <span className="font-medium text-[var(--color-fg)]">
            {session.staffCode}
          </span>
        </p>
      ) : null}

      {gymOrgId ? (
        <StaffInvitesAdminPanel
          gymName={gymName}
          invites={invites}
          listError={listError}
        />
      ) : (
        <>
          <StaffInviteInbox
            invites={inbox}
            listError={inboxError}
            staffCode={session.staffCode}
          />
          {canCreateGym ? (
            <section className="space-y-4" aria-labelledby="create-gym-heading">
              <div>
                <h2
                  id="create-gym-heading"
                  className="text-lg font-semibold tracking-tight text-[var(--color-fg)]"
                >
                  Create your gym
                </h2>
                <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                  You become the owner Admin. Then invite staff from this page.
                </p>
              </div>
              <CreateGymForm />
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
