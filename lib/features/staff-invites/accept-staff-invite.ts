import type { StaffInvitesWriter } from "@/lib/ports/staff-invites";

export function createAcceptStaffInvite(deps: {
  staffInvites: StaffInvitesWriter;
}) {
  return function acceptStaffInvite(input: {
    accessToken: string;
    inviteId: string;
  }) {
    return deps.staffInvites.accept(input);
  };
}
