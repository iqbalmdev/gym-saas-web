import type { AuthGateway } from '@/lib/modules/auth/auth-ports';

export type GetCurrentUserDeps = {
    auth: AuthGateway;
};

export function createGetCurrentUser(deps: GetCurrentUserDeps) {
    return async function getCurrentUser(input: { accessToken: string }) {
        return deps.auth.getMe(input);
    };
}
