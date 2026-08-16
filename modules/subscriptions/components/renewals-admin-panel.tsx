'use client';

import { Button } from '@/components/ui/button';
import { membershipPaymentStatusLabel } from '@/modules/membership-invites/membership-invites-labels';
import { useRenewalsDue, useUpdateSubscriptionPayment } from '@/modules/subscriptions/subscriptions-hooks';
import type { SubscriptionPaymentStatus } from '@/modules/subscriptions/subscriptions-ports';

type RenewalsAdminPanelProps = {
    onOrAfter: string;
    onOrBefore: string;
};

const PAYMENT_OPTIONS: SubscriptionPaymentStatus[] = ['unpaid', 'paid', 'partial'];

export function RenewalsAdminPanel({ onOrAfter, onOrBefore }: RenewalsAdminPanelProps) {
    // Hydrated from the page's server prefetch — same query key (ADR-0011).
    const { data: renewals = [], error: listQueryError } = useRenewalsDue(onOrAfter, onOrBefore);
    const updatePayment = useUpdateSubscriptionPayment(onOrAfter, onOrBefore);

    const isPending = updatePayment.isPending;
    const listError = listQueryError?.message ?? null;
    const error = updatePayment.error?.message ?? null;

    function handlePaymentUpdate(
        subscriptionId: string,
        paymentStatus: SubscriptionPaymentStatus,
        priceAmount: number,
    ) {
        updatePayment.mutate({
            subscriptionId,
            paymentStatus,
            amountPaid:
                paymentStatus === 'partial'
                    ? Math.max(1, Math.floor(priceAmount / 2))
                    : paymentStatus === 'paid'
                      ? priceAmount
                      : 0,
        });
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
