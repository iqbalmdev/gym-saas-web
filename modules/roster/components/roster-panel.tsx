'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { membershipPaymentStatusLabel } from '@/modules/membership-invites/membership-invites-labels';
import { offboardMemberAction, setCheckInBlockAction } from '@/modules/roster/roster-actions';
import type { RosterMember } from '@/modules/roster/roster-ports';

type RosterPanelProps = {
    members: RosterMember[];
    listError: string | null;
};

export function RosterPanel({ members, listError }: RosterPanelProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const active = members.filter((member) => member.status === 'ACTIVE');

    function handleOffboard(membershipId: string) {
        setError(null);
        startTransition(async () => {
            const result = await offboardMemberAction({ membershipId });
            if (!result.ok) {
                setError(result.message);
                return;
            }
            router.refresh();
        });
    }

    function handleCheckInBlock(membershipId: string, blocked: boolean) {
        setError(null);
        startTransition(async () => {
            const result = await setCheckInBlockAction({ membershipId, blocked });
            if (!result.ok) {
                setError(result.message);
                return;
            }
            router.refresh();
        });
    }

    return (
        <section className="space-y-3" aria-labelledby="roster-heading">
            <div>
                <h2 id="roster-heading" className="text-sm font-semibold text-(--color-fg)">
                    Active roster
                </h2>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Payment badges are informational. Check-in block is a manual safety valve — entitlement still
                    follows subscription dates.
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

            {active.length === 0 ? (
                <p className="text-sm text-(--color-fg-muted)">No active members yet. Accepted invites appear here.</p>
            ) : (
                <div className="overflow-hidden rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface)">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-(--color-border) text-xs tracking-wide text-(--color-fg-muted) uppercase hover:bg-transparent">
                                <TableHead className="px-4 py-3 text-(--color-fg-muted)">Member</TableHead>
                                <TableHead className="px-4 py-3 text-(--color-fg-muted)">Payment</TableHead>
                                <TableHead className="px-4 py-3 text-(--color-fg-muted)">Check-in</TableHead>
                                <TableHead className="px-4 py-3 text-(--color-fg-muted)">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {active.map((member) => (
                                <TableRow key={member.membershipId} className="border-(--color-border)">
                                    <TableCell className="px-4 py-3 whitespace-normal">
                                        <p className="font-medium text-(--color-fg)">{member.clientName}</p>
                                        <p className="text-xs text-(--color-fg-muted)">
                                            {member.clientEmail}
                                            {member.clientPhone ? ` · ${member.clientPhone}` : ''}
                                        </p>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Badge variant="outline">
                                            {member.basePaymentStatus
                                                ? membershipPaymentStatusLabel(member.basePaymentStatus)
                                                : '—'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Badge
                                            variant={member.checkInBlocked ? 'destructive' : 'secondary'}
                                            data-testid={`check-in-status-${member.membershipId}`}
                                        >
                                            {member.checkInBlocked ? 'Blocked' : 'Allowed'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 whitespace-normal">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                disabled={isPending}
                                                onClick={() =>
                                                    handleCheckInBlock(member.membershipId, !member.checkInBlocked)
                                                }
                                            >
                                                {member.checkInBlocked ? 'Unblock check-in' : 'Block check-in'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                disabled={isPending}
                                                onClick={() => handleOffboard(member.membershipId)}
                                            >
                                                Offboard
                                            </Button>
                                        </div>
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
