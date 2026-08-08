import type { AuthLane } from "@/lib/ports/auth";

/** sessionStorage key — lane/name chosen before redirecting to Google. */
export const GOOGLE_OAUTH_PENDING_KEY = "gym-saas.google-oauth-pending";

export type GoogleOAuthPending = {
  lane: AuthLane;
  name?: string;
};

export function writeGoogleOAuthPending(pending: GoogleOAuthPending): void {
  sessionStorage.setItem(GOOGLE_OAUTH_PENDING_KEY, JSON.stringify(pending));
}

export function readGoogleOAuthPending(): GoogleOAuthPending | null {
  const raw = sessionStorage.getItem(GOOGLE_OAUTH_PENDING_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("lane" in parsed) ||
      (parsed.lane !== "STAFF" && parsed.lane !== "CLIENT")
    ) {
      return null;
    }
    const name =
      "name" in parsed && typeof parsed.name === "string" && parsed.name.trim()
        ? parsed.name.trim()
        : undefined;
    return { lane: parsed.lane, name };
  } catch {
    return null;
  }
}

export function clearGoogleOAuthPending(): void {
  sessionStorage.removeItem(GOOGLE_OAUTH_PENDING_KEY);
}

/** Parse Supabase OAuth redirect hash (`#access_token=…&refresh_token=…&expires_in=…`). */
export function parseOAuthCallbackHash(hash: string): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  error: string | null;
  errorDescription: string | null;
} | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const error = params.get("error");
  const errorDescription = params.get("error_description");
  if (error) {
    return {
      accessToken: "",
      refreshToken: "",
      expiresIn: 0,
      error,
      errorDescription,
    };
  }
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) {
    return null;
  }
  const expiresRaw = params.get("expires_in");
  const expiresIn = expiresRaw ? Number.parseInt(expiresRaw, 10) : 3600;
  return {
    accessToken,
    refreshToken,
    expiresIn: Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3600,
    error: null,
    errorDescription: null,
  };
}
