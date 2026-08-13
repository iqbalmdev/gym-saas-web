'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
    formatPlanDuration,
    formatPlanPrice,
    planCapabilityLabel,
    planKindLabel,
} from '@/lib/modules/plans/plans-labels';
import { createPlanAction, deletePlanAction, setPlanActiveAction } from '@/lib/modules/plans/plans-actions';
import type { MembershipPlan, PlanKind } from '@/lib/modules/plans/plans-ports';

type PlansAdminPanelProps = {
    gymName: string;
    plans: MembershipPlan[];
    kindFilter: PlanKind | 'ALL';
    listError: string | null;
};

export function PlansAdminPanel({ gymName, plans, kindFilter, listError }: PlansAdminPanelProps) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [kind, setKind] = useState<PlanKind>('BASE');
    const [durationDays, setDurationDays] = useState('30');
    const [price, setPrice] = useState('999');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await createPlanAction({
                name,
                kind,
                durationDays: Number(durationDays),
                price: Number(price),
            });
            if (!result.ok) {
                setError(result.message);
                return;
            }
            setName('');
            setDurationDays('30');
            setPrice(kind === 'ADDON' ? '1500' : '999');
            router.refresh();
        });
    }

    function handleToggle(plan: MembershipPlan) {
        setError(null);
        startTransition(async () => {
            const result = await setPlanActiveAction({
                planId: plan.id,
                active: !plan.active,
            });
            if (!result.ok) {
                setError(result.message);
                return;
            }
            router.refresh();
        });
    }

    function handleDelete(planId: string) {
        setError(null);
        startTransition(async () => {
            const result = await deletePlanAction({ planId });
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
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-fg)] md:text-3xl">Plans</h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--color-fg-muted)]">
                    Base memberships and add-ons (Trainer coaching). Unpaid members stay entitled unless you manually
                    block check-in later.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {(
                    [
                        ['ALL', 'All'],
                        ['BASE', 'Base'],
                        ['ADDON', 'Add-ons'],
                    ] as const
                ).map(([value, label]) => {
                    const href = value === 'ALL' ? '/admin/plans' : `/admin/plans?kind=${value}`;
                    const active = kindFilter === value;
                    return (
                        <a
                            key={value}
                            href={href}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                active
                                    ? 'bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
                                    : 'border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
                            }`}
                        >
                            {label}
                        </a>
                    );
                })}
            </div>

            <form
                onSubmit={handleCreate}
                className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-panel)]"
            >
                <h2 className="text-sm font-medium text-[var(--color-fg)]">Add plan</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="plan-name" className="block text-sm font-medium text-[var(--color-fg)]">
                            Name
                        </label>
                        <input
                            id="plan-name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                            placeholder={kind === 'ADDON' ? 'PT Coaching' : 'Monthly'}
                        />
                    </div>
                    <div>
                        <label htmlFor="plan-kind" className="block text-sm font-medium text-[var(--color-fg)]">
                            Kind
                        </label>
                        <select
                            id="plan-kind"
                            value={kind}
                            onChange={(e) => setKind(e.target.value as PlanKind)}
                            className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        >
                            <option value="BASE">Base membership</option>
                            <option value="ADDON">Add-on (Trainer coaching)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="plan-duration" className="block text-sm font-medium text-[var(--color-fg)]">
                            Duration (days)
                        </label>
                        <input
                            id="plan-duration"
                            type="number"
                            min={1}
                            required
                            value={durationDays}
                            onChange={(e) => setDurationDays(e.target.value)}
                            className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>
                    <div>
                        <label htmlFor="plan-price" className="block text-sm font-medium text-[var(--color-fg)]">
                            Price (INR)
                        </label>
                        <input
                            id="plan-price"
                            type="number"
                            min={0}
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>
                </div>
                {error ? (
                    <p role="alert" className="text-sm text-[var(--color-danger)]">
                        {error}
                    </p>
                ) : null}
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving…' : 'Create plan'}
                </Button>
            </form>

            <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-panel)]">
                <div className="border-b border-[var(--color-border)]/80 px-5 py-3">
                    <h2 className="text-sm font-medium text-[var(--color-fg)]">Catalog for {gymName}</h2>
                </div>
                {listError ? (
                    <p role="alert" className="px-5 py-4 text-sm text-[var(--color-danger)]">
                        {listError}
                    </p>
                ) : plans.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-[var(--color-fg-muted)]">
                        No plans yet. Create a Base membership or an Add-on above.
                    </p>
                ) : (
                    <ul className="divide-y divide-[var(--color-border)]/70">
                        {plans.map((plan) => (
                            <li
                                key={plan.id}
                                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0 space-y-1">
                                    <p className="text-sm font-medium text-[var(--color-fg)]">
                                        {plan.name}
                                        <span className="mx-2 text-[var(--color-fg-muted)]">·</span>
                                        <span className="font-normal text-[var(--color-fg-muted)]">
                                            {planKindLabel(plan.kind)}
                                        </span>
                                    </p>
                                    <p className="text-xs text-[var(--color-fg-muted)]">
                                        {formatPlanPrice(plan.price)} · {formatPlanDuration(plan.durationDays)}
                                        {plan.kind === 'ADDON' ? ` · ${planCapabilityLabel(plan.capability)}` : ''}
                                        {plan.active ? '' : ' · Inactive'}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="text-xs"
                                        disabled={isPending}
                                        onClick={() => handleToggle(plan)}
                                    >
                                        {plan.active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-xs"
                                        disabled={isPending}
                                        onClick={() => handleDelete(plan.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
