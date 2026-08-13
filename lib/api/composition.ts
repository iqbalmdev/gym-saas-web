import { createHttpClient, getApiBaseUrl } from "@/lib/api/client";
import { createAttendanceAdapter } from "@/lib/api/attendance-adapter";
import { createAuthAdapter } from "@/lib/api/auth-adapter";
import {
  areE2eFixturesEnabled,
  createE2eAttendanceAdapter,
  createE2eAuthGateway,
  createE2eGymOrgsAdapter,
  createE2eLeadsAdapter,
  createE2eMembershipInvitesAdapter,
  createE2ePlansAdapter,
  createE2eRosterAdapter,
  createE2eStaffInvitesAdapter,
  createE2eSubscriptionsAdapter,
} from "@/lib/api/e2e-fixtures";
import { createGymOrgsAdapter } from "@/lib/api/gym-orgs-adapter";
import { createLeadsAdapter } from "@/lib/api/leads-adapter";
import { createMembershipInvitesAdapter } from "@/lib/api/membership-invites-adapter";
import { createPlansAdapter } from "@/lib/api/plans-adapter";
import { createRosterAdapter } from "@/lib/api/roster-adapter";
import { createStaffInvitesAdapter } from "@/lib/api/staff-invites-adapter";
import { createSubscriptionsAdapter } from "@/lib/api/subscriptions-adapter";
import { createCompleteGoogle } from "@/lib/features/auth/complete-google";
import { createGetCurrentUser } from "@/lib/features/auth/get-current-user";
import { createRequestOtp } from "@/lib/features/auth/request-otp";
import { createVerifyOtp } from "@/lib/features/auth/verify-otp";
import {
  createDeskMarkAttendance,
  createListDayAttendances,
} from "@/lib/features/attendance/use-cases";
import { createCreateGymOrg } from "@/lib/features/gym-orgs/create-gym-org";
import { createListGymOrgs } from "@/lib/features/gym-orgs/list-gym-orgs";
import {
  createChangeLeadStatus,
  createCreateLead,
  createListDueFollowUps,
  createListLeads,
  createSoftDeleteLead,
  createUpdateLead,
} from "@/lib/features/leads/use-cases";
import {
  createAcceptMembershipInvite,
  createCreateMembershipInvite,
  createGetMyDataGrants,
  createListMembershipInviteInbox,
  createListMembershipInvites,
  createRevokeMembershipInvite,
  createUpdateMyDataGrants,
} from "@/lib/features/membership-invites/use-cases";
import {
  createCreatePlan,
  createListPlans,
  createSoftDeletePlan,
  createUpdatePlan,
} from "@/lib/features/plans/use-cases";
import {
  createListRosterMembers,
  createOffboardMember,
  createSetCheckInBlock,
} from "@/lib/features/roster/use-cases";
import { createAcceptStaffInvite } from "@/lib/features/staff-invites/accept-staff-invite";
import { createCreateStaffInvite } from "@/lib/features/staff-invites/create-staff-invite";
import { createListGymStaffInvites } from "@/lib/features/staff-invites/list-gym-staff-invites";
import { createListStaffInviteInbox } from "@/lib/features/staff-invites/list-staff-invite-inbox";
import { createRevokeStaffInvite } from "@/lib/features/staff-invites/revoke-staff-invite";
import {
  createListRenewalsDue,
  createUpdateSubscriptionPayment,
} from "@/lib/features/subscriptions/use-cases";

/**
 * Composition root — the only place that binds ports → HTTP adapters (DIP).
 * Route handlers / server components call these factories; features never import adapters.
 * Playwright sets `GYM_SAAS_E2E_FIXTURES=1` so RSC/server actions use deterministic fakes.
 */
export function createAppServices() {
  const http = createHttpClient({ baseUrl: getApiBaseUrl() });
  const auth = areE2eFixturesEnabled()
    ? createE2eAuthGateway()
    : createAuthAdapter(http);
  const gymOrgs = areE2eFixturesEnabled()
    ? createE2eGymOrgsAdapter()
    : createGymOrgsAdapter(http);
  const staffInvites = areE2eFixturesEnabled()
    ? createE2eStaffInvitesAdapter()
    : createStaffInvitesAdapter(http);
  const plans = areE2eFixturesEnabled()
    ? createE2ePlansAdapter()
    : createPlansAdapter(http);
  const leads = areE2eFixturesEnabled()
    ? createE2eLeadsAdapter()
    : createLeadsAdapter(http);
  const membershipInvites = areE2eFixturesEnabled()
    ? createE2eMembershipInvitesAdapter()
    : createMembershipInvitesAdapter(http);
  const roster = areE2eFixturesEnabled()
    ? createE2eRosterAdapter()
    : createRosterAdapter(http);
  const attendance = areE2eFixturesEnabled()
    ? createE2eAttendanceAdapter()
    : createAttendanceAdapter(http);
  const subscriptions = areE2eFixturesEnabled()
    ? createE2eSubscriptionsAdapter()
    : createSubscriptionsAdapter(http);

  return {
    auth,
    gymOrgs,
    staffInvites,
    plans,
    leads,
    membershipInvites,
    roster,
    attendance,
    subscriptions,
    requestOtp: createRequestOtp({ auth }),
    verifyOtp: createVerifyOtp({ auth }),
    completeGoogle: createCompleteGoogle({ auth }),
    getCurrentUser: createGetCurrentUser({ auth }),
    listGymOrgs: createListGymOrgs({ gymOrgs }),
    createGymOrg: createCreateGymOrg({ gymOrgs }),
    listGymStaffInvites: createListGymStaffInvites({ staffInvites }),
    listStaffInviteInbox: createListStaffInviteInbox({ staffInvites }),
    createStaffInvite: createCreateStaffInvite({ staffInvites }),
    revokeStaffInvite: createRevokeStaffInvite({ staffInvites }),
    acceptStaffInvite: createAcceptStaffInvite({ staffInvites }),
    listPlans: createListPlans({ plans }),
    createPlan: createCreatePlan({ plans }),
    updatePlan: createUpdatePlan({ plans }),
    softDeletePlan: createSoftDeletePlan({ plans }),
    listLeads: createListLeads({ leads }),
    listDueFollowUps: createListDueFollowUps({ leads }),
    createLead: createCreateLead({ leads }),
    updateLead: createUpdateLead({ leads }),
    changeLeadStatus: createChangeLeadStatus({ leads }),
    softDeleteLead: createSoftDeleteLead({ leads }),
    listMembershipInvites: createListMembershipInvites({ membershipInvites }),
    listMembershipInviteInbox: createListMembershipInviteInbox({
      membershipInvites,
    }),
    createMembershipInvite: createCreateMembershipInvite({ membershipInvites }),
    revokeMembershipInvite: createRevokeMembershipInvite({ membershipInvites }),
    acceptMembershipInvite: createAcceptMembershipInvite({ membershipInvites }),
    getMyDataGrants: createGetMyDataGrants({ membershipInvites }),
    updateMyDataGrants: createUpdateMyDataGrants({ membershipInvites }),
    listRosterMembers: createListRosterMembers({ roster }),
    offboardMember: createOffboardMember({ roster }),
    setCheckInBlock: createSetCheckInBlock({ roster }),
    listDayAttendances: createListDayAttendances({ attendance }),
    deskMarkAttendance: createDeskMarkAttendance({ attendance }),
    listRenewalsDue: createListRenewalsDue({ subscriptions }),
    updateSubscriptionPayment: createUpdateSubscriptionPayment({
      subscriptions,
    }),
  };
}

export type AppServices = ReturnType<typeof createAppServices>;
