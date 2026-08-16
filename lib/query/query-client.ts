import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';

import { ApiClientError } from '@/lib/api/errors';

/**
 * TanStack Query client factory + defaults (ADR-0011).
 *
 * Defaults are set here rather than per-hook on purpose: v5 ships
 * `staleTime: 0`, which refetches on every mount. Against the Gym Backend's
 * ~400ms floor (ADR-0009) that would feel *worse* than the RSC-only version
 * this replaces.
 */

/** Treat list data as fresh for long enough to cover a burst of navigation between ops screens. */
const DEFAULT_STALE_TIME_MS = 30_000;

/** Keep unused entries around well past `staleTime` so back-navigation is instant. */
const DEFAULT_GC_TIME_MS = 5 * 60_000;

const MAX_QUERY_RETRIES = 2;

/**
 * Retrying a 4xx just burns the user's time — the request was rejected on its
 * merits (auth, validation, tenancy), and it will be rejected again. Retry
 * only transport-ish failures and 5xx.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
    if (failureCount >= MAX_QUERY_RETRIES) {
        return false;
    }
    if (error instanceof ApiClientError) {
        return error.status === 0 || error.status >= 500;
    }
    return true;
}

function makeQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: DEFAULT_STALE_TIME_MS,
                gcTime: DEFAULT_GC_TIME_MS,
                retry: shouldRetry,
                // The desk is a long-lived tab; coming back to it should show
                // current data rather than whatever was on screen an hour ago.
                refetchOnWindowFocus: true,
            },
            mutations: {
                // A failed write must surface, not silently replay — every
                // mutation here is a user-visible domain action.
                retry: false,
            },
            dehydrate: {
                // Ship in-flight queries too, so a prefetch that hasn't
                // resolved when the shell flushes still streams to the client
                // instead of being refetched from scratch.
                shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Server: a fresh client per request — a module-level singleton would leak one
 * user's cached tenant data into another user's render.
 * Browser: one singleton for the tab, so the cache survives navigation (the
 * whole point of ADR-0011).
 */
export function getQueryClient(): QueryClient {
    if (isServer) {
        return makeQueryClient();
    }
    browserQueryClient ??= makeQueryClient();
    return browserQueryClient;
}
