import { describe, expect, it } from 'vitest';

import {
    parseOAuthCallbackHash,
    readGoogleOAuthPending,
    writeGoogleOAuthPending,
    clearGoogleOAuthPending,
    GOOGLE_OAUTH_PENDING_KEY,
} from '@/modules/auth/google-oauth-pending';
import { buildGoogleOAuthStartUrl } from '@/modules/auth/google-oauth-start';

describe('parseOAuthCallbackHash', () => {
    it('reads tokens and expires_in from the fragment', () => {
        const parsed = parseOAuthCallbackHash('#access_token=at&refresh_token=rt&expires_in=7200');
        expect(parsed).toEqual({
            accessToken: 'at',
            refreshToken: 'rt',
            expiresIn: 7200,
            error: null,
            errorDescription: null,
        });
    });

    it('defaults expires_in when missing', () => {
        const parsed = parseOAuthCallbackHash('#access_token=at&refresh_token=rt');
        expect(parsed?.expiresIn).toBe(3600);
    });

    it('surfaces OAuth error from the fragment', () => {
        const parsed = parseOAuthCallbackHash('#error=access_denied&error_description=User+denied');
        expect(parsed?.error).toBe('access_denied');
        expect(parsed?.errorDescription).toBe('User denied');
    });

    it('returns null when tokens are missing', () => {
        expect(parseOAuthCallbackHash('#access_token=only')).toBeNull();
    });
});

describe('google oauth pending storage', () => {
    it('round-trips lane and optional name', () => {
        const store = new Map<string, string>();
        const original = globalThis.sessionStorage;
        Object.defineProperty(globalThis, 'sessionStorage', {
            configurable: true,
            value: {
                getItem: (key: string) => store.get(key) ?? null,
                setItem: (key: string, value: string) => {
                    store.set(key, value);
                },
                removeItem: (key: string) => {
                    store.delete(key);
                },
            },
        });

        writeGoogleOAuthPending({ lane: 'STAFF', name: 'Ada' });
        expect(readGoogleOAuthPending()).toEqual({ lane: 'STAFF', name: 'Ada' });
        clearGoogleOAuthPending();
        expect(store.has(GOOGLE_OAUTH_PENDING_KEY)).toBe(false);
        expect(readGoogleOAuthPending()).toBeNull();

        Object.defineProperty(globalThis, 'sessionStorage', {
            configurable: true,
            value: original,
        });
    });
});

describe('buildGoogleOAuthStartUrl', () => {
    it('points at API start with web callback redirect_to', () => {
        const url = new URL(buildGoogleOAuthStartUrl('http://localhost:3000/'));
        expect(url.pathname).toBe('/auth/google/start');
        expect(url.searchParams.get('redirect_to')).toBe('http://localhost:3000/auth/google/callback');
    });
});
