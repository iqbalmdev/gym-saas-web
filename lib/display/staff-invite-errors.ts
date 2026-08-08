/** Calm copy for Staff Invite API error codes (Postman Staff Invites). */
const STAFF_INVITE_ERROR_COPY: Record<string, string> = {
  STAFF_INVITE_FORBIDDEN:
    "You cannot manage staff invites for this gym with this account.",
  STAFF_ALREADY_AFFILIATED: "That staff member is already part of this gym.",
  STAFF_INVITE_ADMIN_CAP:
    "This gym already has the maximum number of Admins. Invite as Trainer, or revoke an unused Admin invite.",
  UNIQUE_VIOLATION: "An invite for that staff member is already pending.",
  INVALID_STAFF_INVITEE: "No staff account found for that staff code.",
  STAFF_INVITE_INVALID_TRANSITION:
    "That invite cannot be changed from its current status.",
  STAFF_INVITE_EXPIRED: "That invite has expired. Ask for a new one.",
  CONFLICT: "That invite can no longer be accepted.",
  NOT_FOUND: "We could not find that invite.",
  AUTHENTICATION_FAILED: "Your session expired. Sign in again.",
  VALIDATION_ERROR: "Check the details you entered and try again.",
  NETWORK_OR_UNKNOWN: "Could not reach the server. Check your connection.",
};

export function staffInviteErrorMessage(
  code: string,
  fallbackMessage?: string,
): string {
  return (
    STAFF_INVITE_ERROR_COPY[code] ??
    fallbackMessage ??
    "Something went wrong. Please try again."
  );
}
