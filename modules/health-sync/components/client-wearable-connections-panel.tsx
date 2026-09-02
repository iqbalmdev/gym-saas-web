'use client';

import { useState, type ReactElement } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useConnectWearable,
    useDisconnectWearable,
    useMyWearableConnections,
} from '@/modules/health-sync/health-sync-hooks';
import { WEARABLE_PROVIDERS, formatLastSynced, wearableProviderLabel } from '@/modules/health-sync/health-sync-labels';
import type { WearableConnection, WearableProvider } from '@/modules/health-sync/health-sync-ports';

type ClientWearableConnectionsPanelProps = {
    /** RSC prefetch — keeps the list visible even if the client refetch lags. */
    initial?: WearableConnection[];
};

export function ClientWearableConnectionsPanel({ initial }: ClientWearableConnectionsPanelProps): ReactElement {
    const { data: connections, error: listError, isPending } = useMyWearableConnections(initial);
    const connect = useConnectWearable();
    const disconnect = useDisconnectWearable();

    const [provider, setProvider] = useState<WearableProvider>('HEALTH_CONNECT');

    const isBusy = connect.isPending || disconnect.isPending;
    const error = connect.error?.message ?? disconnect.error?.message ?? listError?.message ?? null;
    const live = connections?.filter((item) => item.active) ?? [];

    return (
        <section
            className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="client-wearables-heading"
        >
            <div>
                <h2 id="client-wearables-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                    Connected apps
                </h2>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Linking an app here lets your phone push daily steps, calories, and weight. The reading itself
                    happens in the Yeah Buddy mobile app — this page shows what has arrived.
                </p>
            </div>

            {error ? (
                <p role="alert" className="text-sm text-(--color-danger)">
                    {error}
                </p>
            ) : null}

            {isPending && !connections ? (
                <p className="text-sm text-(--color-fg-muted)">Loading connections…</p>
            ) : live.length === 0 ? (
                <p className="text-sm text-(--color-fg-muted)">No health apps connected yet.</p>
            ) : (
                <ul className="divide-y divide-(--color-border) rounded-(--radius-panel) border border-(--color-border)">
                    {live.map((connection) => (
                        <li key={connection.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                            <div>
                                <p className="flex items-center gap-2 text-sm font-medium text-(--color-fg)">
                                    {wearableProviderLabel(connection.provider)}
                                    <Badge variant="success">Connected</Badge>
                                </p>
                                <p className="mt-1 text-xs text-(--color-fg-muted)">
                                    Last sync: {formatLastSynced(connection.lastSyncedAt)}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                aria-label={`Disconnect ${wearableProviderLabel(connection.provider)}`}
                                disabled={isBusy}
                                onClick={() => disconnect.mutate(connection.provider)}
                            >
                                {disconnect.isPending ? 'Disconnecting…' : 'Disconnect'}
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex flex-wrap items-end gap-3 border-t border-(--color-border) pt-4">
                <div className="text-sm">
                    <span className="font-medium text-(--color-fg)">Add a health app</span>
                    <Select
                        value={provider}
                        onValueChange={(value) => setProvider(value as WearableProvider)}
                        disabled={isBusy}
                    >
                        <SelectTrigger className="mt-1 w-56" aria-label="Add a health app">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {WEARABLE_PROVIDERS.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {wearableProviderLabel(item)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button type="button" disabled={isBusy} onClick={() => connect.mutate(provider)}>
                    {connect.isPending ? 'Connecting…' : 'Connect'}
                </Button>
            </div>
        </section>
    );
}
