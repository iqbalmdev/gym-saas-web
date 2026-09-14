'use client';

import type { ReactElement } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import type { GrantAware } from '@/lib/domain/grant-aware';
import { WearableMetricsTable } from '@/modules/health-sync/components/wearable-metrics-table';
import { useStaffClientWearableMetrics } from '@/modules/health-sync/health-sync-hooks';
import type { WearableMetric } from '@/modules/health-sync/health-sync-ports';

type StaffClientWearablesPanelProps = {
    clientUserId: string;
    /** RSC prefetch — keeps the table visible even if the client refetch lags. */
    initial?: GrantAware<WearableMetric[]>;
};

export function StaffClientWearablesPanel({ clientUserId, initial }: StaffClientWearablesPanelProps): ReactElement {
    const { data, error, isPending, isFetching, refetch } = useStaffClientWearableMetrics(clientUserId, initial);

    if (isPending && !data) {
        return <p className="text-sm text-(--color-fg-muted)">Loading health sync…</p>;
    }

    if (error && !data) {
        return (
            <div className="space-y-2" role="alert">
                <p className="text-sm text-(--color-danger)">{error.message}</p>
                <button
                    type="button"
                    className="text-sm text-(--color-fg) underline-offset-4 hover:underline"
                    onClick={() => void refetch()}
                >
                    Try again
                </button>
            </div>
        );
    }

    // Missing cache is loading — never treat as "not shared".
    if (!data) {
        return <p className="text-sm text-(--color-fg-muted)">Loading health sync…</p>;
    }

    if (data.status === 'not_shared') {
        return (
            <EmptyState
                title="Health sync"
                description="Member has not shared wearable metrics with this gym. Ask them to enable Wearables under Data sharing on their Home screen."
            />
        );
    }

    const metrics = data.data;

    return (
        <section
            className="space-y-3 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="staff-wearables-heading"
        >
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h2 id="staff-wearables-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                        Health sync
                    </h2>
                    <p className="mt-1 text-sm text-(--color-fg-muted)">
                        Daily wearable metrics this member has shared
                        {metrics.length > 0 ? ` · ${metrics.length} day${metrics.length === 1 ? '' : 's'}` : ''}.
                    </p>
                </div>
                <button
                    type="button"
                    className="text-sm text-(--color-fg-muted) underline-offset-4 hover:text-(--color-fg) hover:underline"
                    onClick={() => void refetch()}
                    disabled={isFetching}
                >
                    {isFetching ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            {metrics.length === 0 ? (
                <p className="text-sm text-(--color-fg-muted)">
                    Wearables are shared, but nothing has synced yet. Metrics arrive from the member&apos;s phone.
                </p>
            ) : (
                <WearableMetricsTable metrics={metrics} />
            )}
        </section>
    );
}
