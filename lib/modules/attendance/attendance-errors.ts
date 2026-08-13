/** Calm copy for attendance desk API errors. */
const ATTENDANCE_ERROR_COPY: Record<string, string> = {
  AUTHENTICATION_FAILED: "Your session expired. Sign in again.",
  FORBIDDEN: "You need Admin access at this gym to mark attendance.",
  ATTENDANCE_FORBIDDEN:
    "You need Admin access at this gym to mark attendance.",
  NOT_FOUND: "That member was not found.",
  VALIDATION_ERROR: "Pick a member and try again.",
  NETWORK_OR_UNKNOWN: "Could not reach the server. Check your connection.",
};

export function attendanceErrorMessage(
  code: string,
  fallbackMessage?: string,
): string {
  return (
    ATTENDANCE_ERROR_COPY[code] ??
    fallbackMessage ??
    "Something went wrong. Please try again."
  );
}
