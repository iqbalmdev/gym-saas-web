import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import {
    SESSION_COOKIE_NAME,
    decodeSession,
    encodeSession,
    needsRefresh,
    rotateSessionSnapshot,
} from '@/lib/auth/session-model';

/**
 * Keeps the session cookie's access/refresh token pair fresh (ADR: silent
 * session refresh). This is an *optimistic* side effect, not the auth gate —
 * every page/Server Action still calls `getSession()` and decides access
 * itself (`security-data-access.mdc`). Proxy only makes sure that by the
 * time they run, the cookie isn't sitting on a token that's about to expire.
 *
 * Runs on ~every request but only makes a network call when the access
 * token is within `needsRefresh`'s buffer of expiring — the common case is a
 * cheap cookie decode + integer comparison, no fetch.
 */
export default async function proxy(request: NextRequest) {
    const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!cookie) {
        return NextResponse.next();
    }

    const snapshot = decodeSession(cookie);
    if (!snapshot || !needsRefresh(snapshot)) {
        return NextResponse.next();
    }

    try {
        const { auth } = createAppServices();
        const { session } = await auth.refreshSession({ refreshToken: snapshot.refreshToken });
        const rotated = rotateSessionSnapshot(snapshot, session);
        const encoded = encodeSession(rotated);

        // Make the rotated cookie visible to the current render (RSC/Server
        // Action reading `cookies()` downstream) as well as the browser.
        request.cookies.set(SESSION_COOKIE_NAME, encoded);
        const response = NextResponse.next({ request });
        response.cookies.set(SESSION_COOKIE_NAME, encoded, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: Math.max(60, Math.floor((rotated.expiresAt - Date.now()) / 1000)),
        });
        return response;
    } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
            // Refresh token itself is dead (expired/already rotated/invalid).
            // Clear the cookie so the page/action gate treats this exactly
            // like "no session" and redirects to /login — same as today.
            const response = NextResponse.next();
            response.cookies.delete(SESSION_COOKIE_NAME);
            return response;
        }
        // Network blip / 5xx / timeout on the refresh call itself: never
        // punish the user for a transient failure by dropping a cookie that
        // might still work. Leave it untouched and let the normal gate run.
        return NextResponse.next();
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
