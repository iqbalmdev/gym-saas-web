import type { AuthGateway, AuthLane } from '@/lib/modules/auth/auth-ports';

export type VerifyOtpDeps = {
    auth: AuthGateway;
};

export function createVerifyOtp(deps: VerifyOtpDeps) {
    return async function verifyOtp(input: { email: string; token: string; lane?: AuthLane; name?: string }) {
        return deps.auth.verifyOtp(input);
    };
}
