import type { StaffInvitesReader } from "@/lib/ports/staff-invites";

export function createListGymStaffInvites(deps: {
  staffInvites: StaffInvitesReader;
}) {
  return function listGymStaffInvites(input: {
    accessToken: string;
    gymOrgId: string;
    limit?: number;
    offset?: number;
  }) {
    return deps.staffInvites.listForGym(input);
  };
}
