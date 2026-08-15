'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deskMarkAttendanceAction } from '@/modules/attendance/attendance-actions';
import type { Attendance } from '@/modules/attendance/attendance-ports';
import type { RosterMember } from '@/modules/roster/roster-ports';

type AttendanceAdminPanelProps = {
    gymName: string;
    day: string;
    members: RosterMember[];
    attendances: Attendance[];
    listError: string | null;
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

export function AttendanceAdminPanel({ gymName, day, members, attendances, listError }: AttendanceAdminPanelProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [clientUserId, setClientUserId] = useState(members[0]?.clientUserId ?? '');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

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

    function handleDeskMark(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await deskMarkAttendanceAction({ clientUserId });
            if (!result.ok) {
                setError(result.message);
                return;
            }
            router.refresh();
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-medium tracking-wide text-(--color-fg-muted) uppercase">{gymName}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-(--color-fg) md:text-3xl">Attendance</h1>
                <p className="mt-2 max-w-2xl text-sm text-(--color-fg-muted)">
                    Desk-mark members for today ({day}). Entitlement follows subscription dates, not payment status.
                </p>
            </div>

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
                                onValueChange={(value) => setClientUserId(value ?? '')}
                                disabled={isPending}
                            >
                                <SelectTrigger className="mt-1 w-full" aria-label="Member">
                                    <SelectValue placeholder="Select a member" />
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
