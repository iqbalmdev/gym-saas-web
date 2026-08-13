/** Calm copy for plan catalog API errors. */
const PLAN_ERROR_COPY: Record<string, string> = {
  AUTHENTICATION_FAILED: "Your session expired. Sign in again.",
  FORBIDDEN: "You need Admin access at this gym to manage plans.",
  NOT_FOUND: "That plan was not found.",
  VALIDATION_ERROR: "Check the plan details and try again.",
  NETWORK_OR_UNKNOWN: "Could not reach the server. Check your connection.",
};

export function planErrorMessage(code: string, fallbackMessage?: string): string {
  return PLAN_ERROR_COPY[code] ?? fallbackMessage ?? "Something went wrong. Please try again.";
}
