import type { AuthGateway } from "@/lib/ports/auth";

export type RequestOtpDeps = {
  auth: AuthGateway;
};

export function createRequestOtp(deps: RequestOtpDeps) {
  return async function requestOtp(input: { email: string }) {
    return deps.auth.requestOtp(input);
  };
}
