import { E2E_STAFF_TOKEN_NO_GYM, E2E_STAFF_TOKEN_WITH_GYM } from '../../lib/api/e2e/store';
import { SESSION_COOKIE_NAME, encodeSession, type SessionSnapshot } from '../../lib/auth/session-model';

export function encodeStaffSessionCookie(overrides: Partial<SessionSnapshot> = {}): {
    name: string;
    value: string;
    url: string;
} {
    const snapshot: SessionSnapshot = {
        accessToken: E2E_STAFF_TOKEN_WITH_GYM,
        refreshToken: 'e2e-refresh-token',
        expiresAt: Date.now() + 60 * 60 * 1000,
        userId: 'e2e-user-1',
        email: 'e2e-admin@example.com',
        name: 'E2E Admin',
        lane: 'STAFF',
        roleCode: 'STAFF_UNASSIGNED',
        staffCode: 'STF-E2E',
        ...overrides,
    };

    return {
        name: SESSION_COOKIE_NAME,
        value: encodeSession(snapshot),
        url: 'http://127.0.0.1:3001',
    };
}

/** Staff session with zero GymOrg affiliations (Settings-only first-run). */
export function encodeStaffSessionCookieNoGym(overrides: Partial<SessionSnapshot> = {}) {
    return encodeStaffSessionCookie({
        accessToken: E2E_STAFF_TOKEN_NO_GYM,
        ...overrides,
    });
}
