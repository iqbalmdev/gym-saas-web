'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getJson } from '@/lib/query/api-fetch';
import { updateSubscriptionPaymentAction } from '@/modules/subscriptions/subscriptions-actions';
import { subscriptionErrorMessage } from '@/modules/subscriptions/subscriptions-errors';
import type { RenewalDueItem, SubscriptionPaymentStatus } from '@/modules/subscriptions/subscriptions-ports';
import { subscriptionsKeys } from '@/modules/subscriptions/subscriptions-query-keys';

/** Renewals inbox client hooks (ADR-0011). */

export function useRenewalsDue(onOrAfter: string, onOrBefore: string) {
    return useQuery({
        queryKey: subscriptionsKeys.renewalsDue(onOrAfter, onOrBefore),
        queryFn: async () => {
            const { renewals } = await getJson<{ renewals: RenewalDueItem[] }>(
                `/api/subscriptions/renewals?onOrAfter=${onOrAfter}&onOrBefore=${onOrBefore}`,
                subscriptionErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return renewals;
        },
    });
}

export function useUpdateSubscriptionPayment(onOrAfter: string, onOrBefore: string) {
    const queryClient = useQueryClient();
    const key = subscriptionsKeys.renewalsDue(onOrAfter, onOrBefore);

    return useMutation({
        mutationFn: async (input: {
            subscriptionId: string;
            paymentStatus: SubscriptionPaymentStatus;
            amountPaid: number;
        }) => {
            const result = await updateSubscriptionPaymentAction(input);
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onMutate: async (input) => {
            await queryClient.cancelQueries({ queryKey: key });
            const previous = queryClient.getQueryData<RenewalDueItem[]>(key);
            if (previous) {
                queryClient.setQueryData<RenewalDueItem[]>(
                    key,
                    previous.map((item) =>
                        item.id === input.subscriptionId
                            ? { ...item, paymentStatus: input.paymentStatus, amountPaid: input.amountPaid }
                            : item,
                    ),
                );
            }
            return { previous };
        },
        onError: (_error, _input, context) => {
            if (context?.previous) {
                queryClient.setQueryData<RenewalDueItem[]>(key, context.previous);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: subscriptionsKeys.all }),
    });
}
