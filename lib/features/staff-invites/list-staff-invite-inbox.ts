import type { StaffInvitesReader } from "@/lib/ports/staff-invites";

export function createListStaffInviteInbox(deps: {
  staffInvites: StaffInvitesReader;
}) {
  return function listStaffInviteInbox(input: {
    accessToken: string;
    limit?: number;
    offset?: number;
  }) {
    return deps.staffInvites.listInbox(input);
  };
}
