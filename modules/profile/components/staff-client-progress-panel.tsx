'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStaffClientProgressLogs } from '@/modules/profile/profile-hooks';
import { formatProfileMeasure } from '@/modules/profile/profile-labels';

export function StaffClientProgressPanel({ clientUserId }: { clientUserId: string }) {
    const { data, error, isPending } = useStaffClientProgressLogs(clientUserId);

    if (isPending) {
        return <p className="text-sm text-(--color-fg-muted)">Loading progress…</p>;
    }

    if (error) {
        return (
            <p role="alert" className="text-sm text-(--color-danger)">
                {error.message}
            </p>
        );
    }

    if (!data || data.status === 'not_shared') {
        return <EmptyState title="Progress" description="Member has not shared progress with this gym." />;
    }

    const logs = data.data;

    return (
        <section
            className="space-y-3 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="staff-progress-heading"
        >
            <div>
                <h2 id="staff-progress-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                    Progress
                </h2>
                <p className="mt-1 text-sm text-(--color-fg-muted)">Weight history this member has shared.</p>
            </div>

            {logs.length === 0 ? (
                <p className="text-sm text-(--color-fg-muted)">No progress logs yet.</p>
            ) : (
                <div className="overflow-hidden rounded-(--radius-panel) border border-(--color-border)">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-(--color-border) text-xs tracking-wide text-(--color-fg-muted) uppercase hover:bg-transparent">
                                <TableHead className="px-4 py-3 text-(--color-fg-muted)">Date</TableHead>
                                <TableHead className="px-4 py-3 text-(--color-fg-muted)">Weight</TableHead>
                                <TableHead className="px-4 py-3 text-(--color-fg-muted)">BMI</TableHead>
                                <TableHead className="px-4 py-3 text-(--color-fg-muted)">Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id} className="border-(--color-border)">
                                    <TableCell className="px-4 py-3">{log.logDate}</TableCell>
                                    <TableCell className="px-4 py-3">
                                        {formatProfileMeasure(log.weightKg, 'kg')}
                                    </TableCell>
                                    <TableCell className="px-4 py-3">{log.bmi ?? '—'}</TableCell>
                                    <TableCell className="px-4 py-3 text-(--color-fg-muted)">
                                        {log.notes ?? '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </section>
    );
}
