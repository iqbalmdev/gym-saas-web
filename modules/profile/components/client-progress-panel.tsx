'use client';

import { useState, type SubmitEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useMyProgressLogs, useUpsertMyProgressLog } from '@/modules/profile/profile-hooks';
import { formatProfileMeasure } from '@/modules/profile/profile-labels';

function todayUtc(): string {
    return new Date().toISOString().slice(0, 10);
}

export function ClientProgressPanel() {
    const { data: logs = [], error: listQueryError } = useMyProgressLogs();
    const upsertLog = useUpsertMyProgressLog();

    const [logDate, setLogDate] = useState(todayUtc);
    const [weightKg, setWeightKg] = useState('');
    const [notes, setNotes] = useState('');

    const isPending = upsertLog.isPending;
    const error = upsertLog.error?.message ?? listQueryError?.message ?? null;
    const success = upsertLog.isSuccess ? 'Progress saved.' : null;

    function handleSave(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        upsertLog.mutate(
            { logDate, weightKg, notes },
            {
                onSuccess: () => {
                    setWeightKg('');
                    setNotes('');
                },
            },
        );
    }

    return (
        <section
            className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="client-progress-heading"
        >
            <div>
                <h2 id="client-progress-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                    Progress
                </h2>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Log weight for a calendar day. This updates your current profile weight when a weight is set.
                </p>
            </div>

            {error ? (
                <p role="alert" className="text-sm text-(--color-danger)">
                    {error}
                </p>
            ) : null}
            {success ? (
                <p role="status" className="text-sm text-(--color-fg)">
                    {success}
                </p>
            ) : null}

            <form className="grid gap-3 md:grid-cols-3" onSubmit={handleSave}>
                <label className="block text-sm">
                    <span className="font-medium text-(--color-fg)">Date</span>
                    <Input
                        className="mt-1"
                        type="date"
                        value={logDate}
                        onChange={(event) => setLogDate(event.target.value)}
                        required
                        disabled={isPending}
                    />
                </label>
                <label className="block text-sm">
                    <span className="font-medium text-(--color-fg)">Weight (kg)</span>
                    <Input
                        className="mt-1"
                        inputMode="decimal"
                        value={weightKg}
                        onChange={(event) => setWeightKg(event.target.value)}
                        disabled={isPending}
                    />
                </label>
                <label className="block text-sm md:col-span-3">
                    <span className="font-medium text-(--color-fg)">Notes (optional)</span>
                    <Textarea
                        className="mt-1"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        disabled={isPending}
                        rows={2}
                    />
                </label>
                <div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Saving…' : 'Save progress'}
                    </Button>
                </div>
            </form>

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
