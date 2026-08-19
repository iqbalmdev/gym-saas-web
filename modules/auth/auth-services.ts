import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled } from '@/lib/api/e2e/store';
import { createE2eAuthGateway } from '@/modules/auth/auth-e2e-fixtures';
import { createAuthAdapter } from '@/modules/auth/auth-adapter';
import { createCompleteGoogle } from '@/modules/auth/complete-google';
import { createGetCurrentUser } from '@/modules/auth/get-current-user';
import { createRequestOtp } from '@/modules/auth/request-otp';
import { createVerifyOtp } from '@/modules/auth/verify-otp';

/** Binds the auth port to its adapter and use-cases (ADR-0007). */
export function authServices(http: HttpClient) {
    const auth = areE2eFixturesEnabled() ? createE2eAuthGateway() : createAuthAdapter(http);
    return {
        auth,
        requestOtp: createRequestOtp({ auth }),
        verifyOtp: createVerifyOtp({ auth }),
        completeGoogle: createCompleteGoogle({ auth }),
        getCurrentUser: createGetCurrentUser({ auth }),
    };
}
