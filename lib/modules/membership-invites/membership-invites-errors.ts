/** Calm copy for membership invite API errors. */
const MEMBERSHIP_INVITE_ERROR_COPY: Record<string, string> = {
  AUTHENTICATION_FAILED: "Your session expired. Sign in again.",
  FORBIDDEN: "You need Admin access at this gym to manage membership invites.",
  PLAN_FORBIDDEN: "You need Admin access at this gym to manage membership invites.",
  MEMBERSHIP_INVITE_FORBIDDEN:
    "Sign in as a Member (not Staff) with the invited email to accept.",
  NOT_FOUND: "That membership invite was not found.",
  MEMBERSHIP_INVITE_EXPIRED: "This invite has expired. Ask the gym to send a new one.",
  ACTIVE_MEMBERSHIP_CONFLICT:
    "You already have an active membership. Leave or finish that one first.",
  INVALID_INVITE_PLAN:
    "Pick an active Base plan for this gym (and a matching Add-on if used).",
  INVALID_MEMBERSHIP_INVITEE:
    "That email belongs to a staff account — invite a client email instead.",
  MEMBERSHIP_INVITE_INVALID_TRANSITION:
    "This invite is no longer pending.",
  DATA_GRANT_FORBIDDEN:
    "Sign in as a Member with an active membership to manage sharing.",
  VALIDATION_ERROR: "Check the invite details and try again.",
  NETWORK_OR_UNKNOWN: "Could not reach the server. Check your connection.",
};

export function membershipInviteErrorMessage(
  code: string,
  fallbackMessage?: string,
): string {
  return (
    MEMBERSHIP_INVITE_ERROR_COPY[code] ??
    fallbackMessage ??
    "Something went wrong. Please try again."
  );
}
