import type { StaffInvitesWriter } from "@/lib/ports/staff-invites";

export function createRevokeStaffInvite(deps: {
  staffInvites: StaffInvitesWriter;
}) {
  return function revokeStaffInvite(input: {
    accessToken: string;
    inviteId: string;
  }) {
    return deps.staffInvites.revoke(input);
  };
}
