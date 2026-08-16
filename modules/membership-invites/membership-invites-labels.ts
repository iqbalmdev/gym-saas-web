import { inviteStatusTone, type StatusTone } from '@/lib/ui/status-tone';
import type {
    MembershipInviteStatus,
    MembershipPaymentStatus,
} from '@/modules/membership-invites/membership-invites-ports';

/** Membership and staff invites share one enum shape and one tone mapping — see `inviteStatusTone`. */
export const membershipInviteStatusTone: (status: MembershipInviteStatus) => StatusTone = inviteStatusTone;

export function membershipPaymentStatusTone(status: MembershipPaymentStatus): StatusTone {
    switch (status) {
        case 'paid':
            return 'positive';
        case 'partial':
        case 'unpaid':
            // Not danger: entitlement follows subscription dates, not payment_status
            // (`000-project-context.mdc`). An unpaid member still trains.
            return 'warning';
    }
}

export function membershipInviteStatusLabel(status: MembershipInviteStatus): string {
    switch (status) {
        case 'PENDING':
            return 'Pending';
        case 'ACCEPTED':
            return 'Accepted';
        case 'REVOKED':
            return 'Revoked';
        case 'EXPIRED':
            return 'Expired';
        default:
            return status;
    }
}

export function membershipPaymentStatusLabel(status: MembershipPaymentStatus): string {
    switch (status) {
        case 'paid':
            return 'Paid';
        case 'unpaid':
            return 'Unpaid';
        case 'partial':
            return 'Partial';
        default:
            return status;
    }
}

export function formatInviteExpiry(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
