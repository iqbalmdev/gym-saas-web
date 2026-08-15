import { describe, expect, it } from 'vitest';

import {
    buildSessionSnapshot,
    decodeSession,
    encodeSession,
    isClientSession,
    isStaffSession,
    needsRefresh,
    rotateSessionSnapshot,
    type SessionSnapshot,
} from '@/lib/auth/session-model';
import type { AuthSession, AuthUser } from '@/modules/auth/auth-ports';

const staffUser: AuthUser = {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin',
    lane: 'STAFF',
    roleCode: 'STAFF_UNASSIGNED',
    staffCode: 'STF-TEST',
    emailVerifiedAt: '2026-08-04T00:00:00.000Z',
};

const clientUser: AuthUser = {
    ...staffUser,
    lane: 'CLIENT',
    roleCode: 'CLIENT',
    staffCode: null,
};

const session: AuthSession = {
    accessToken: 'access',
    refreshToken: 'refresh',
    expiresIn: 3600,
};

describe('buildSessionSnapshot', () => {
    it('copies STAFF identity fields into the cookie snapshot', () => {
        const snapshot = buildSessionSnapshot(session, staffUser);

        expect(snapshot.accessToken).toBe('access');
        expect(snapshot.refreshToken).toBe('refresh');
        expect(snapshot.userId).toBe('user-1');
        expect(snapshot.email).toBe('admin@example.com');
        expect(snapshot.name).toBe('Admin');
        expect(snapshot.lane).toBe('STAFF');
        expect(snapshot.roleCode).toBe('STAFF_UNASSIGNED');
        expect(snapshot.staffCode).toBe('STF-TEST');
        expect(snapshot.expiresAt).toBeGreaterThan(Date.now());
    });
});

describe('encodeSession / decodeSession', () => {
    it('round-trips a valid snapshot', () => {
        const snapshot = buildSessionSnapshot(session, staffUser);
        const decoded = decodeSession(encodeSession(snapshot));
        expect(decoded).toEqual(snapshot);
    });

    it('returns null for corrupt cookie payloads', () => {
        expect(decodeSession('not-valid')).toBeNull();
    });
});

describe('isStaffSession', () => {
    it('allows STAFF lane into Admin shell', () => {
        const snapshot: SessionSnapshot = buildSessionSnapshot(session, staffUser);
        expect(isStaffSession(snapshot)).toBe(true);
    });

    it('rejects CLIENT lane from Admin shell', () => {
        const snapshot: SessionSnapshot = buildSessionSnapshot(session, clientUser);
        expect(isStaffSession(snapshot)).toBe(false);
    });
});

describe('isClientSession', () => {
    it('allows CLIENT lane into Client home', () => {
        const snapshot: SessionSnapshot = buildSessionSnapshot(session, clientUser);
        expect(isClientSession(snapshot)).toBe(true);
    });
});

describe('rotateSessionSnapshot', () => {
    it('replaces tokens and expiry but keeps identity fields from the previous snapshot', () => {
        const previous = buildSessionSnapshot(session, staffUser);
        const rotated = rotateSessionSnapshot(previous, {
            accessToken: 'new-access',
            refreshToken: 'new-refresh',
            expiresIn: 3600,
        });

        expect(rotated.accessToken).toBe('new-access');
        expect(rotated.refreshToken).toBe('new-refresh');
        expect(rotated.expiresAt).toBeGreaterThan(previous.expiresAt - 1000);
        expect(rotated.userId).toBe(previous.userId);
        expect(rotated.email).toBe(previous.email);
        expect(rotated.name).toBe(previous.name);
        expect(rotated.lane).toBe(previous.lane);
        expect(rotated.roleCode).toBe(previous.roleCode);
        expect(rotated.staffCode).toBe(previous.staffCode);
    });
});

describe('needsRefresh', () => {
    it('is false when the access token has plenty of time left', () => {
        const snapshot = buildSessionSnapshot(session, staffUser); // expires in 1h
        expect(needsRefresh(snapshot)).toBe(false);
    });

    it('is true once inside the default 60s buffer', () => {
        const snapshot: SessionSnapshot = {
            ...buildSessionSnapshot(session, staffUser),
            expiresAt: Date.now() + 30_000,
        };
        expect(needsRefresh(snapshot)).toBe(true);
    });

    it('is true once already expired', () => {
        const snapshot: SessionSnapshot = {
            ...buildSessionSnapshot(session, staffUser),
            expiresAt: Date.now() - 1,
        };
        expect(needsRefresh(snapshot)).toBe(true);
    });

    it('respects a custom buffer', () => {
        const snapshot: SessionSnapshot = {
            ...buildSessionSnapshot(session, staffUser),
            expiresAt: Date.now() + 120_000,
        };
        expect(needsRefresh(snapshot, 60_000)).toBe(false);
        expect(needsRefresh(snapshot, 180_000)).toBe(true);
    });
});
