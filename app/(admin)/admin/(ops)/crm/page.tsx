import { LeadsAdminPanel } from "@/components/admin/leads-admin-panel";
import { createAppServices } from "@/lib/api/composition";
import { ApiClientError } from "@/lib/api/errors";
import { getSession, isStaffSession } from "@/lib/auth/session";
import { leadErrorMessage } from "@/lib/display/lead-errors";
import { listStaffGymOrgs } from "@/lib/features/gym-orgs/list-staff-gym-orgs";
import type { Lead, LeadStatus } from "@/lib/ports/leads";

type CrmPageProps = {
  searchParams: Promise<{ status?: string }>;
};

function parseStatus(raw: string | undefined): LeadStatus | "ALL" {
  if (
    raw === "NEW" ||
    raw === "CONTACTED" ||
    raw === "TRIAL" ||
    raw === "CONVERTED" ||
    raw === "LOST"
  ) {
    return raw;
  }
  return "ALL";
}

export default async function CrmPage({ searchParams }: CrmPageProps) {
  const session = await getSession();
  if (!session || !isStaffSession(session)) {
    return null;
  }

  const params = await searchParams;
  const statusFilter = parseStatus(params.status);
  const gymOrgs = await listStaffGymOrgs(session.accessToken);
  const gym = gymOrgs[0];
  if (!gym) {
    return null;
  }

  let leads: Lead[] = [];
  let dueFollowUps: Lead[] = [];
  let listError: string | null = null;

  try {
    const { listLeads, listDueFollowUps } = createAppServices();
    const [listResult, dueResult] = await Promise.all([
      listLeads({
        accessToken: session.accessToken,
        gymOrgId: gym.id,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      }),
      listDueFollowUps({
        accessToken: session.accessToken,
        gymOrgId: gym.id,
      }),
    ]);
    leads = listResult.leads.items;
    dueFollowUps = dueResult.leads.items;
  } catch (error) {
    listError =
      error instanceof ApiClientError
        ? leadErrorMessage(error.code, error.message)
        : leadErrorMessage("NETWORK_OR_UNKNOWN");
  }

  return (
    <LeadsAdminPanel
      gymName={gym.name}
      leads={leads}
      dueFollowUps={dueFollowUps}
      statusFilter={statusFilter}
      listError={listError}
    />
  );
}
