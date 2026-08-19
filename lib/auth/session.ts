import { cookies } from 'next/headers';

import {
    SESSION_COOKIE_MAX_AGE_SECONDS,
    SESSION_COOKIE_NAME,
    buildSessionSnapshot,
    decodeSession,
    encodeSession,
    isClientSession,
    isStaffSession,
    needsRefresh,
    rotateSessionSnapshot,
    type SessionSnapshot,
} from '@/lib/auth/session-model';

export {
    SESSION_COOKIE_MAX_AGE_SECONDS,
    SESSION_COOKIE_NAME,
    buildSessionSnapshot,
    isClientSession,
    isStaffSession,
    needsRefresh,
    rotateSessionSnapshot,
    type SessionSnapshot,
};

/**
 * Admin web session (ADR-0005) — httpOnly cookie only.
 */

export async function getSession(): Promise<SessionSnapshot | null> {
    const jar = await cookies();
    const raw = jar.get(SESSION_COOKIE_NAME)?.value;
    if (!raw) {
        return null;
    }
    const snapshot = decodeSession(raw);
    if (!snapshot) {
        return null;
    }
    if (snapshot.expiresAt <= Date.now()) {
        return null;
    }
    return snapshot;
}

export async function setSession(snapshot: SessionSnapshot): Promise<void> {
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, encodeSession(snapshot), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    });
}

export async function clearSession(): Promise<void> {
    const jar = await cookies();
    jar.delete(SESSION_COOKIE_NAME);
}
