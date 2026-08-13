'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
    formatInviteExpiry,
    membershipInviteStatusLabel,
    membershipPaymentStatusLabel,
} from '@/lib/modules/membership-invites/membership-invites-labels';
import {
    createMembershipInviteAction,
    revokeMembershipInviteAction,
} from '@/lib/modules/membership-invites/membership-invites-actions';
import type {
    MembershipInvite,
    MembershipPaymentStatus,
} from '@/lib/modules/membership-invites/membership-invites-ports';
import type { MembershipPlan } from '@/lib/modules/plans/plans-ports';

type MembersAdminPanelProps = {
    gymName: string;
    invites: MembershipInvite[];
    basePlans: MembershipPlan[];
    addonPlans: MembershipPlan[];
    listError: string | null;
};

const PAYMENT_OPTIONS: MembershipPaymentStatus[] = ['unpaid', 'paid', 'partial'];

export function MembersAdminPanel({ gymName, invites, basePlans, addonPlans, listError }: MembersAdminPanelProps) {
    const router = useRouter();
    const [inviteeName, setInviteeName] = useState('');
    const [invitedEmail, setInvitedEmail] = useState('');
    const [inviteePhone, setInviteePhone] = useState('');
    const [basePlanId, setBasePlanId] = useState(basePlans[0]?.id ?? '');
    const [basePaymentStatus, setBasePaymentStatus] = useState<MembershipPaymentStatus>('unpaid');
    const [addonPlanId, setAddonPlanId] = useState('');
    const [addonPaymentStatus, setAddonPaymentStatus] = useState<MembershipPaymentStatus>('unpaid');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function planName(planId: string): string {
        const plan = basePlans.find((item) => item.id === planId) ?? addonPlans.find((item) => item.id === planId);
        return plan?.name ?? planId.slice(0, 8);
    }

    function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await createMembershipInviteAction({
                inviteeName,
                invitedEmail,
                inviteePhone: inviteePhone || undefined,
                basePlanId,
                basePaymentStatus,
                addonPlanId: addonPlanId || undefined,
                addonPaymentStatus: addonPlanId ? addonPaymentStatus : undefined,
            });
            if (!result.ok) {
                setError(result.message);
                return;
            }
            setInviteeName('');
            setInvitedEmail('');
            setInviteePhone('');
            setAddonPlanId('');
            router.refresh();
        });
    }

    function handleRevoke(membershipInviteId: string) {
        setError(null);
        startTransition(async () => {
            const result = await revokeMembershipInviteAction({ membershipInviteId });
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
                <p className="text-xs font-medium tracking-wide text-[var(--color-fg-muted)] uppercase">{gymName}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-fg)] md:text-3xl">
                    Members
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--color-fg-muted)]">
                    Invite clients by email with a Base plan (optional Trainer add-on). Payment badges are informational
                    — entitlement follows subscription dates after accept.
                </p>
            </div>

            {(listError || error) && (
                <p
                    className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-danger)]"
                    role="alert"
                >
                    {error ?? listError}
                </p>
            )}

            <section className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-panel)] md:p-6">
                <h2 className="text-sm font-semibold text-[var(--color-fg)]">Invite member</h2>
                {basePlans.length === 0 ? (
                    <p className="mt-3 text-sm text-[var(--color-fg-muted)]">
                        Create an active Base plan under Plans before sending a membership invite.
                    </p>
                ) : (
                    <form className="mt-4 space-y-3" onSubmit={handleCreate}>
                        <div className="grid gap-3 md:grid-cols-2">
                            <label className="block text-sm">
                                <span className="font-medium text-[var(--color-fg)]">Name</span>
                                <input
                                    className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm"
                                    value={inviteeName}
                                    onChange={(event) => setInviteeName(event.target.value)}
                                    placeholder="Alex Client"
                                    required
                                    disabled={isPending}
                                />
                            </label>
                            <label className="block text-sm">
                                <span className="font-medium text-[var(--color-fg)]">Email</span>
                                <input
                                    type="email"
                                    className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm"
                                    value={invitedEmail}
                                    onChange={(event) => setInvitedEmail(event.target.value)}
                                    placeholder="alex.client@example.com"
                                    required
                                    disabled={isPending}
                                />
                            </label>
                            <label className="block text-sm">
                                <span className="font-medium text-[var(--color-fg)]">Phone (optional)</span>
                                <input
                                    className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm"
                                    value={inviteePhone}
                                    onChange={(event) => setInviteePhone(event.target.value)}
                                    placeholder="+15551234567"
                                    disabled={isPending}
                                />
                            </label>
                            <label className="block text-sm">
                                <span className="font-medium text-[var(--color-fg)]">Base plan</span>
                                <select
                                    className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm"
                                    value={basePlanId}
                                    onChange={(event) => setBasePlanId(event.target.value)}
                                    required
                                    disabled={isPending}
                                >
                                    {basePlans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block text-sm">
                                <span className="font-medium text-[var(--color-fg)]">Base payment</span>
                                <select
                                    className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm"
                                    value={basePaymentStatus}
                                    onChange={(event) =>
                                        setBasePaymentStatus(event.target.value as MembershipPaymentStatus)
                                    }
                                    disabled={isPending}
                                >
                                    {PAYMENT_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {membershipPaymentStatusLabel(status)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block text-sm">
                                <span className="font-medium text-[var(--color-fg)]">Add-on (optional)</span>
                                <select
                                    className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm"
                                    value={addonPlanId}
                                    onChange={(event) => setAddonPlanId(event.target.value)}
                                    disabled={isPending || addonPlans.length === 0}
                                >
                                    <option value="">None</option>
                                    {addonPlans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            {addonPlanId ? (
                                <label className="block text-sm">
                                    <span className="font-medium text-[var(--color-fg)]">Add-on payment</span>
                                    <select
                                        className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm"
                                        value={addonPaymentStatus}
                                        onChange={(event) =>
                                            setAddonPaymentStatus(event.target.value as MembershipPaymentStatus)
                                        }
                                        disabled={isPending}
                                    >
                                        {PAYMENT_OPTIONS.map((status) => (
                                            <option key={status} value={status}>
                                                {membershipPaymentStatusLabel(status)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ) : null}
                        </div>
                        <Button type="submit" disabled={isPending || !basePlanId}>
                            {isPending ? 'Sending…' : 'Send membership invite'}
                        </Button>
                    </form>
                )}
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-[var(--color-fg)]">Membership invites</h2>
                {invites.length === 0 ? (
                    <p className="text-sm text-[var(--color-fg-muted)]">No membership invites yet.</p>
                ) : (
                    <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                        {invites.map((invite) => (
                            <li
                                key={invite.id}
                                className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="min-w-0 space-y-1">
                                    <p className="font-medium text-[var(--color-fg)]">{invite.inviteeName}</p>
                                    <p className="truncate text-sm text-[var(--color-fg-muted)]">
                                        {invite.invitedEmail}
                                        {invite.inviteePhone ? ` · ${invite.inviteePhone}` : ''}
                                    </p>
                                    <p className="text-xs text-[var(--color-fg-muted)]">
                                        {planName(invite.basePlanId)} ·{' '}
                                        {membershipPaymentStatusLabel(invite.basePaymentStatus)}
                                        {invite.addonPlanId ? ` · + ${planName(invite.addonPlanId)}` : ''}
                                        {' · expires '}
                                        {formatInviteExpiry(invite.expiresAt)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-[var(--color-fg)]">
                                        {membershipInviteStatusLabel(invite.status)}
                                    </span>
                                    {invite.status === 'PENDING' ? (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={isPending}
                                            onClick={() => handleRevoke(invite.id)}
                                        >
                                            Revoke
                                        </Button>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
