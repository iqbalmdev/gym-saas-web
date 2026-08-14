import type {
    SubscriptionsReader,
    SubscriptionsWriter,
    UpdateSubscriptionPaymentInput,
} from '@/modules/subscriptions/subscriptions-ports';

export function createListRenewalsDue(deps: { subscriptions: SubscriptionsReader }) {
    return async function listRenewalsDue(input: {
        accessToken: string;
        gymOrgId: string;
        onOrBefore?: string;
        onOrAfter?: string;
    }) {
        return deps.subscriptions.listRenewalsDue(input);
    };
}

export function createUpdateSubscriptionPayment(deps: { subscriptions: SubscriptionsWriter }) {
    return async function updateSubscriptionPayment(input: {
        accessToken: string;
        gymOrgId: string;
        subscriptionId: string;
        body: UpdateSubscriptionPaymentInput;
    }) {
        return deps.subscriptions.updatePayment(input);
    };
}
