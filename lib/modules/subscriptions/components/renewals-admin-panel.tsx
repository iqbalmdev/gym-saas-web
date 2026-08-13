'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { membershipPaymentStatusLabel } from '@/lib/modules/membership-invites/membership-invites-labels';
import { updateSubscriptionPaymentAction } from '@/lib/modules/subscriptions/subscriptions-actions';
import type { RenewalDueItem, SubscriptionPaymentStatus } from '@/lib/modules/subscriptions/subscriptions-ports';

type RenewalsAdminPanelProps = {
    gymName: string;
    renewals: RenewalDueItem[];
    windowLabel: string;
    listError: string | null;
};

const PAYMENT_OPTIONS: SubscriptionPaymentStatus[] = ['unpaid', 'paid', 'partial'];

export function RenewalsAdminPanel({ gymName, renewals, windowLabel, listError }: RenewalsAdminPanelProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handlePaymentUpdate(
        subscriptionId: string,
        paymentStatus: SubscriptionPaymentStatus,
        priceAmount: number,
    ) {
        setError(null);
        startTransition(async () => {
            const result = await updateSubscriptionPaymentAction({
                subscriptionId,
                paymentStatus,
                ...(paymentStatus === 'partial'
                    ? { amountPaid: Math.max(1, Math.floor(priceAmount / 2)) }
                    : paymentStatus === 'paid'
                      ? { amountPaid: priceAmount }
                      : { amountPaid: 0 }),
            });
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
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-(--color-fg) md:text-3xl">Renewals</h1>
                <p className="mt-2 max-w-2xl text-sm text-(--color-fg-muted)">
                    Subscriptions ending {windowLabel}. Payment badges nudge — they do not auto lock check-in.
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

            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-(--color-fg)">Renewals due</h2>
                {renewals.length === 0 ? (
                    <p className="text-sm text-(--color-fg-muted)">No renewals in this window.</p>
                ) : (
                    <ul className="divide-y divide-(--color-border) rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface)">
                        {renewals.map((item) => (
                            <li
                                key={item.id}
                                className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="min-w-0 space-y-1">
                                    <p className="font-medium text-(--color-fg)">
                                        {item.kind} · ends {item.endDate ?? '—'}
                                    </p>
                                    <p className="text-sm text-(--color-fg-muted)">
                                        Client {item.clientUserId.slice(0, 8)}… · ₹{item.priceAmount} /{' '}
                                        {item.durationDays}d
                                    </p>
                                    <p className="text-xs text-(--color-fg-muted)">
                                        {membershipPaymentStatusLabel(item.paymentStatus)}
                                        {item.amountPaid > 0 ? ` · paid ₹${item.amountPaid}` : ''}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {PAYMENT_OPTIONS.map((status) => (
                                        <Button
                                            key={status}
                                            type="button"
                                            variant="secondary"
                                            disabled={isPending || item.paymentStatus === status}
                                            onClick={() => handlePaymentUpdate(item.id, status, item.priceAmount)}
                                        >
                                            Mark {membershipPaymentStatusLabel(status)}
                                        </Button>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
