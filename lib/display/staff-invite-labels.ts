import type {
  StaffInviteStatus,
  StaffInviteTargetRole,
} from "@/lib/ports/staff-invites";

export function staffInviteRoleLabel(role: StaffInviteTargetRole): string {
  switch (role) {
    case "TRAINER":
      return "Trainer";
    case "ADMIN":
      return "Admin";
  }
}

export function staffInviteStatusLabel(status: StaffInviteStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "ACCEPTED":
      return "Accepted";
    case "REVOKED":
      return "Revoked";
    case "EXPIRED":
      return "Expired";
  }
}

export function formatInviteExpiry(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}
