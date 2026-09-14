import type { ReactElement } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    formatWearableCount,
    formatWearableWeight,
    wearableProviderLabel,
} from '@/modules/health-sync/health-sync-labels';
import type { WearableMetric } from '@/modules/health-sync/health-sync-ports';

type WearableMetricsTableProps = {
    metrics: WearableMetric[];
};

/** Shared by the member's own view and the grant-gated staff view — same columns, same units. */
export function WearableMetricsTable({ metrics }: WearableMetricsTableProps): ReactElement {
    return (
        <div className="overflow-hidden rounded-(--radius-panel) border border-(--color-border)">
            <Table>
                <TableHeader>
                    <TableRow className="border-(--color-border) text-xs tracking-wide text-(--color-fg-muted) uppercase hover:bg-transparent">
                        <TableHead className="px-4 py-3 text-(--color-fg-muted)">Date</TableHead>
                        <TableHead className="px-4 py-3 text-(--color-fg-muted)">Steps</TableHead>
                        <TableHead className="px-4 py-3 text-(--color-fg-muted)">Active calories</TableHead>
                        <TableHead className="px-4 py-3 text-(--color-fg-muted)">Workout</TableHead>
                        <TableHead className="px-4 py-3 text-(--color-fg-muted)">Weight</TableHead>
                        <TableHead className="px-4 py-3 text-(--color-fg-muted)">Source</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {metrics.map((metric) => (
                        <TableRow key={metric.id} className="border-(--color-border)">
                            <TableCell className="px-4 py-3">{metric.metricOn}</TableCell>
                            <TableCell className="px-4 py-3">{formatWearableCount(metric.steps, 'steps')}</TableCell>
                            <TableCell className="px-4 py-3">
                                {formatWearableCount(metric.activeKcal, 'kcal')}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                {formatWearableCount(metric.workoutMinutes, 'min')}
                            </TableCell>
                            <TableCell className="px-4 py-3">{formatWearableWeight(metric.weightKg)}</TableCell>
                            <TableCell className="px-4 py-3 text-(--color-fg-muted)">
                                {wearableProviderLabel(metric.provider)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
