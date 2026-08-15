import { describe, expect, it } from 'vitest';

import {
    buildSessionSnapshot,
    decodeSession,
    encodeSession,
    isClientSession,
    isStaffSession,
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
