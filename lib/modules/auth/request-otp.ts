import type { AuthGateway } from '@/lib/modules/auth/auth-ports';

export type RequestOtpDeps = {
    auth: AuthGateway;
};

export function createRequestOtp(deps: RequestOtpDeps) {
    return async function requestOtp(input: { email: string }) {
        return deps.auth.requestOtp(input);
    };
}
