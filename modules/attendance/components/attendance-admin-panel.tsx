'use client';

import { useMemo, useState, type SubmitEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttendanceDay, useDeskMarkAttendance } from '@/modules/attendance/attendance-hooks';

type AttendanceAdminPanelProps = {
    gymOrgId: string;
    day: string;
};

function formatTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function AttendanceAdminPanel({ gymOrgId, day }: AttendanceAdminPanelProps) {
    const [query, setQuery] = useState('');
    const [clientUserIdOverride, setClientUserIdOverride] = useState<string | null>(null);

    // Hydrated from the page's server prefetch — same query key (ADR-0011).
    const { data, error: listQueryError } = useAttendanceDay(day);
    const members = useMemo(() => data?.members ?? [], [data]);
    const attendances = data?.attendances ?? [];

    const deskMark = useDeskMarkAttendance(day, gymOrgId);
    const isPending = deskMark.isPending;
    const listError = listQueryError?.message ?? null;
    const error = deskMark.error?.message ?? null;

    // Defaults to the first member until one is picked — the roster now
    // arrives asynchronously, so it can't seed useState at mount.
    const clientUserId = clientUserIdOverride ?? members[0]?.clientUserId ?? '';

    const filteredMembers = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return members;
        }
        return members.filter(
            (member) =>
                member.clientName.toLowerCase().includes(q) ||
                member.clientEmail.toLowerCase().includes(q) ||
                (member.clientPhone ?? '').toLowerCase().includes(q),
        );
    }, [members, query]);

    const nameByUserId = useMemo(() => {
        const map = new Map<string, string>();
        for (const member of members) {
            map.set(member.clientUserId, member.clientName);
        }
        return map;
    }, [members]);

    function handleDeskMark(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        // Optimistic write + rollback live in useDeskMarkAttendance.
        deskMark.mutate({ clientUserId });
    }

    return (
        <div className="space-y-6">
            {(listError || error) && (
                <p
                    className="rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-danger)"
                    role="alert"
                >
                    {error ?? listError}
                </p>
            )}

            <section className="rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-panel) md:p-6">
                <h2 className="text-sm font-semibold text-(--color-fg)">Desk mark</h2>
                {members.length === 0 ? (
                    <p className="mt-3 text-sm text-(--color-fg-muted)">
                        No active members to mark. Accept a membership invite first.
                    </p>
                ) : (
                    <form className="mt-4 space-y-3" onSubmit={handleDeskMark}>
                        <label className="block text-sm">
                            <span className="font-medium text-(--color-fg)">Search</span>
                            <Input
                                className="mt-1"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Name, email, or phone"
                                disabled={isPending}
                            />
                        </label>
                        <label className="block text-sm">
                            <span className="font-medium text-(--color-fg)">Member</span>
                            <Select
                                value={clientUserId}
                                onValueChange={(value) => setClientUserIdOverride(value ?? '')}
                                disabled={isPending}
                            >
                                <SelectTrigger className="mt-1 w-full" aria-label="Member">
                                    {/* <SelectValue> has no default value→label lookup (Base UI) — without a
                                        children render-prop it shows the raw clientUserId. */}
                                    <SelectValue>
                                        {(value: string) => {
                                            if (!value) {
                                                return 'Select a member';
                                            }
                                            const member = members.find((item) => item.clientUserId === value);
                                            return member ? `${member.clientName} · ${member.clientEmail}` : value;
                                        }}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredMembers.map((member) => (
                                        <SelectItem key={member.membershipId} value={member.clientUserId}>
                                            {member.clientName} · {member.clientEmail}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>
                        <Button type="submit" disabled={isPending || !clientUserId}>
                            {isPending ? 'Marking…' : 'Mark attendance'}
                        </Button>
                    </form>
                )}
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-(--color-fg)">Today&apos;s attendance</h2>
                {attendances.length === 0 ? (
                    <p className="text-sm text-(--color-fg-muted)">No attendance recorded for today yet.</p>
                ) : (
                    <ul className="divide-y divide-(--color-border) rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface)">
                        {attendances.map((item) => (
                            <li
                                key={item.id}
                                className="flex flex-col gap-1 px-4 py-3 md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <p className="font-medium text-(--color-fg)">
                                        {nameByUserId.get(item.clientUserId) ?? item.clientUserId}
                                    </p>
                                    <p className="text-xs text-(--color-fg-muted)">
                                        {item.recordedBy === 'ADMIN' ? 'Desk' : 'Self'} · {formatTime(item.occurredAt)}
                                        {item.baseStarted ? ' · base started' : ''}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
