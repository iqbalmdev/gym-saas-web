'use client';

import type { ReactElement } from 'react';

import { WearableMetricsTable } from '@/modules/health-sync/components/wearable-metrics-table';
import { useMyWearableMetrics } from '@/modules/health-sync/health-sync-hooks';
import type { WearableMetric } from '@/modules/health-sync/health-sync-ports';

type ClientWearableMetricsPanelProps = {
    /** RSC prefetch — keeps the table visible even if the client refetch lags. */
    initial?: WearableMetric[];
};

export function ClientWearableMetricsPanel({ initial }: ClientWearableMetricsPanelProps): ReactElement {
    const { data: metrics, error, isPending } = useMyWearableMetrics(initial);

    return (
        <section
            className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="client-wearable-metrics-heading"
        >
            <div>
                <h2
                    id="client-wearable-metrics-heading"
                    className="text-lg font-semibold tracking-tight text-(--color-fg)"
                >
                    Synced metrics
                </h2>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Daily totals your phone has pushed. These stay yours — a gym sees them only if you enable Wearables
                    under Data sharing.
                </p>
            </div>

            {error ? (
                <p role="alert" className="text-sm text-(--color-danger)">
                    {error.message}
                </p>
            ) : null}

            {isPending && !metrics ? (
                <p className="text-sm text-(--color-fg-muted)">Loading metrics…</p>
            ) : !(metrics && metrics.length > 0) ? (
                <p className="text-sm text-(--color-fg-muted)">
                    Nothing synced yet. Open the mobile app and allow health permissions to push your first day.
                </p>
            ) : (
                <WearableMetricsTable metrics={metrics} />
            )}
        </section>
    );
}
