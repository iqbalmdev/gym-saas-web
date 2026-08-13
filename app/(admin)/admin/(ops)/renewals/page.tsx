import { RenewalsAdminPanel } from "@/lib/modules/subscriptions/components/renewals-admin-panel";
import { createAppServices } from "@/lib/api/composition";
import { ApiClientError } from "@/lib/api/errors";
import { getSession, isStaffSession } from "@/lib/auth/session";
import { subscriptionErrorMessage } from "@/lib/modules/subscriptions/subscriptions-errors";
import { listStaffGymOrgs } from "@/lib/modules/gym-orgs/list-staff-gym-orgs";
import type { RenewalDueItem } from "@/lib/modules/subscriptions/subscriptions-ports";

function isoDateOffset(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function RenewalsPage() {
  const session = await getSession();
  if (!session || !isStaffSession(session)) {
    return null;
  }

  const gymOrgs = await listStaffGymOrgs(session.accessToken);
  const gym = gymOrgs[0];
  if (!gym) {
    return null;
  }

  const onOrAfter = isoDateOffset(0);
  const onOrBefore = isoDateOffset(2);
  let renewals: RenewalDueItem[] = [];
  let listError: string | null = null;

  try {
    const { listRenewalsDue } = createAppServices();
    const { renewals: page } = await listRenewalsDue({
      accessToken: session.accessToken,
      gymOrgId: gym.id,
      onOrAfter,
      onOrBefore,
    });
    renewals = page.items;
  } catch (error) {
    listError =
      error instanceof ApiClientError
        ? subscriptionErrorMessage(error.code, error.message)
        : subscriptionErrorMessage("NETWORK_OR_UNKNOWN");
  }

  return (
    <RenewalsAdminPanel
      gymName={gym.name}
      renewals={renewals}
      windowLabel={`${onOrAfter} → ${onOrBefore}`}
      listError={listError}
    />
  );
}
