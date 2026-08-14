import type { AuthSession, AuthUser } from '@/modules/auth/auth-ports';

/**
 * Admin web session snapshot (ADR-0005) — serializable cookie payload.
 * Kept free of `next/headers` so Vitest/E2E can import safely.
 */

export type SessionSnapshot = {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    userId: string;
    email: string;
    name: string | null;
    lane: 'CLIENT' | 'STAFF';
    roleCode: string;
    staffCode: string | null;
};

export const SESSION_COOKIE_NAME = 'gym_saas_session';

export function buildSessionSnapshot(session: AuthSession, user: AuthUser): SessionSnapshot {
    return {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: Date.now() + session.expiresIn * 1000,
        userId: user.id,
        email: user.email,
        name: user.name,
        lane: user.lane,
        roleCode: user.roleCode,
        staffCode: user.staffCode,
    };
}

export function encodeSession(snapshot: SessionSnapshot): string {
    return Buffer.from(JSON.stringify(snapshot), 'utf8').toString('base64url');
}

export function decodeSession(value: string): SessionSnapshot | null {
    try {
        const json = Buffer.from(value, 'base64url').toString('utf8');
        const parsed = JSON.parse(json) as SessionSnapshot;
        if (
            typeof parsed.accessToken !== 'string' ||
            typeof parsed.userId !== 'string' ||
            typeof parsed.expiresAt !== 'number'
        ) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export function isStaffSession(snapshot: SessionSnapshot): boolean {
    return snapshot.lane === 'STAFF';
}

export function isClientSession(snapshot: SessionSnapshot): boolean {
    return snapshot.lane === 'CLIENT';
}
