'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { getQueryClient } from '@/lib/query/query-client';

/**
 * Mounts the TanStack cache for the whole app (ADR-0011).
 *
 * `getQueryClient()` rather than `useState(() => new QueryClient())`: it
 * already returns a per-request client on the server and the tab singleton in
 * the browser, which is the property that makes the cache survive navigation.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
