import type {
  CreateStaffInviteInput,
  StaffInvitesWriter,
} from "@/lib/modules/staff-invites/staff-invites-ports";

export function createCreateStaffInvite(deps: {
  staffInvites: StaffInvitesWriter;
}) {
  return function createStaffInvite(input: {
    accessToken: string;
    gymOrgId: string;
    body: CreateStaffInviteInput;
  }) {
    return deps.staffInvites.create(input);
  };
}
