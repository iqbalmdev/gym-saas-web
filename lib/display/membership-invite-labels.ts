import type { MembershipInviteStatus, MembershipPaymentStatus } from "@/lib/ports/membership-invites";

export function membershipInviteStatusLabel(
  status: MembershipInviteStatus,
): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "ACCEPTED":
      return "Accepted";
    case "REVOKED":
      return "Revoked";
    case "EXPIRED":
      return "Expired";
    default:
      return status;
  }
}

export function membershipPaymentStatusLabel(
  status: MembershipPaymentStatus,
): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "unpaid":
      return "Unpaid";
    case "partial":
      return "Partial";
    default:
      return status;
  }
}

export function formatInviteExpiry(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
