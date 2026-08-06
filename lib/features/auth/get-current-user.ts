import type { AuthGateway } from "@/lib/ports/auth";

export type GetCurrentUserDeps = {
  auth: AuthGateway;
};

export function createGetCurrentUser(deps: GetCurrentUserDeps) {
  return async function getCurrentUser(input: { accessToken: string }) {
    return deps.auth.getMe(input);
  };
}
