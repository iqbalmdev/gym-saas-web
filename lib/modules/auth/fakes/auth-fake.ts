/**
 * In-memory AuthGateway for unit tests (Liskov — same contract as HTTP adapter).
 */
import type { AuthGateway, AuthUser } from '@/lib/modules/auth/auth-ports';

export function createFakeAuthGateway(overrides?: Partial<AuthGateway>): AuthGateway {
    const user: AuthUser = {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'staff@example.com',
        name: 'Test Staff',
        lane: 'STAFF',
        roleCode: 'STAFF_UNASSIGNED',
        staffCode: 'STF-TEST',
        emailVerifiedAt: '2026-08-04T00:00:00.000Z',
    };

    return {
        requestOtp: async () => ({ status: 'OTP_SENT', isNewUser: true }),
        verifyOtp: async () => ({
            session: {
                accessToken: 'test-access',
                refreshToken: 'test-refresh',
                expiresIn: 3600,
            },
            user,
        }),
        completeGoogle: async () => ({ user }),
        getMe: async () => ({ user }),
        ...overrides,
    };
}
