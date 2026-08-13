import type { AuthGateway, AuthLane } from "@/lib/modules/auth/auth-ports";

export type CompleteGoogleDeps = {
  auth: AuthGateway;
};

export function createCompleteGoogle(deps: CompleteGoogleDeps) {
  return async function completeGoogle(input: {
    accessToken: string;
    lane: AuthLane;
    name?: string;
  }) {
    return deps.auth.completeGoogle(input);
  };
}
