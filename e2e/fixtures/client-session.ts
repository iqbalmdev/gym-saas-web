import { SESSION_COOKIE_NAME, encodeSession, type SessionSnapshot } from '../../lib/auth/session-model';

export function encodeClientSessionCookie(overrides: Partial<SessionSnapshot> = {}): {
    name: string;
    value: string;
    url: string;
} {
    const snapshot: SessionSnapshot = {
        accessToken: 'e2e-client-access', // E2E_CLIENT_TOKEN in lib/api/e2e-fixtures
        refreshToken: 'e2e-client-refresh',
        expiresAt: Date.now() + 60 * 60 * 1000,
        userId: 'e2e-client-1',
        email: 'e2e-client@example.com',
        name: 'E2E Client',
        lane: 'CLIENT',
        roleCode: 'CLIENT',
        staffCode: null,
        ...overrides,
    };

    return {
        name: SESSION_COOKIE_NAME,
        value: encodeSession(snapshot),
        url: 'http://127.0.0.1:3001',
    };
}
