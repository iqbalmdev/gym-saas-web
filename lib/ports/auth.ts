/**
 * AuthGateway port — application depends on this interface (DIP), not HTTP.
 * @see docs/api/client-auth.md
 */
export type AuthLane = "CLIENT" | "STAFF";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  lane: AuthLane;
  roleCode: string;
  staffCode: string | null;
  emailVerifiedAt: string | null;
};

export type RequestOtpResult = {
  status: "OTP_SENT";
  isNewUser: boolean;
};

export type AuthGateway = {
  requestOtp: (input: { email: string }) => Promise<RequestOtpResult>;
  verifyOtp: (input: {
    email: string;
    token: string;
    lane?: AuthLane;
    name?: string;
  }) => Promise<{ session: AuthSession; user: AuthUser }>;
  getMe: (input: { accessToken: string }) => Promise<{ user: AuthUser }>;
};
