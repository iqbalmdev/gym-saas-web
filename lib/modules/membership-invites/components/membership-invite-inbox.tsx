'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
    formatInviteExpiry,
    membershipInviteStatusLabel,
    membershipPaymentStatusLabel,
} from '@/lib/modules/membership-invites/membership-invites-labels';
import { acceptMembershipInviteAction } from '@/lib/modules/membership-invites/membership-invites-actions';
import type {
    MembershipInvite,
    OptionalClassGrant,
    OptionalProfileAttribute,
} from '@/lib/modules/membership-invites/membership-invites-ports';

type MembershipInviteInboxProps = {
    invites: MembershipInvite[];
    listError: string | null;
};

const PROFILE_OPTIONS: { value: OptionalProfileAttribute; label: string }[] = [
    { value: 'GENDER', label: 'Gender' },
    { value: 'MEDICAL_NOTES', label: 'Medical notes' },
];

const GRANT_OPTIONS: { value: OptionalClassGrant; label: string }[] = [
    { value: 'PROGRESS', label: 'Progress' },
    { value: 'CALORIES', label: 'Calories' },
    { value: 'WEARABLES', label: 'Wearables' },
    { value: 'DIET_PLANS', label: 'Diet plans' },
    { value: 'WORKOUT_PLANS', label: 'Workout plans' },
];

export function MembershipInviteInbox({ invites, listError }: MembershipInviteInboxProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [profileAttrs, setProfileAttrs] = useState<OptionalProfileAttribute[]>([]);
    const [classGrants, setClassGrants] = useState<OptionalClassGrant[]>([]);
    const [isPending, startTransition] = useTransition();

    const pending = invites.filter((invite) => invite.status === 'PENDING');

    function toggleProfile(value: OptionalProfileAttribute) {
        setProfileAttrs((current) =>
            current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
        );
    }

    function toggleGrant(value: OptionalClassGrant) {
        setClassGrants((current) =>
            current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
        );
    }

    function handleAccept(membershipInviteId: string) {
        setError(null);
        setSuccess(null);
        startTransition(async () => {
            const result = await acceptMembershipInviteAction({
                membershipInviteId,
                optionalProfileAttributes: profileAttrs,
                optionalClassGrants: classGrants,
            });
            if (!result.ok) {
                setError(result.message);
                return;
            }
            setSuccess('Membership accepted. You are now a member of this gym.');
            router.refresh();
        });
    }

    return (
        <section
            className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="membership-invite-inbox-heading"
        >
            <div>
                <h2
                    id="membership-invite-inbox-heading"
                    className="text-lg font-semibold tracking-tight text-(--color-fg)"
                >
                    Gym invites
                </h2>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Accept with the same email the gym invited. Date of birth, height, and weight are always shared;
                    extra sharing is optional.
                </p>
            </div>

            {listError ? (
                <p role="alert" className="text-sm text-(--color-danger)">
                    {listError}
                </p>
            ) : null}
            {error ? (
                <p role="alert" className="text-sm text-(--color-danger)">
                    {error}
                </p>
            ) : null}
            {success ? (
                <p role="status" className="text-sm text-(--color-fg)">
                    {success}
                </p>
            ) : null}

            {!listError && pending.length === 0 ? (
                <p className="text-sm text-(--color-fg-muted)">
                    No pending gym invites. Ask the desk to invite this email.
                </p>
            ) : null}

            {pending.length > 0 ? (
                <ul className="space-y-4">
                    {pending.map((invite) => (
                        <li
                            key={invite.id}
                            className="space-y-4 rounded-md border border-(--color-border)/80 px-4 py-4"
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-(--color-fg)">
                                    {invite.gym?.name ?? 'Gym invite'}
                                </p>
                                <p className="text-sm text-(--color-fg-muted)">
                                    {membershipInviteStatusLabel(invite.status)}
                                    <span className="mx-2">·</span>
                                    Base {membershipPaymentStatusLabel(invite.basePaymentStatus)}
                                </p>
                                <p className="text-xs text-(--color-fg-muted)">
                                    Invited as {invite.inviteeName} · expires {formatInviteExpiry(invite.expiresAt)}
                                </p>
                            </div>

                            <fieldset className="space-y-2">
                                <legend className="text-xs font-medium tracking-wide text-(--color-fg-muted) uppercase">
                                    Optional profile
                                </legend>
                                <div className="flex flex-wrap gap-3">
                                    {PROFILE_OPTIONS.map((option) => (
                                        <label
                                            key={option.value}
                                            className="flex items-center gap-2 text-sm text-(--color-fg)"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={profileAttrs.includes(option.value)}
                                                onChange={() => toggleProfile(option.value)}
                                                disabled={isPending}
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <fieldset className="space-y-2">
                                <legend className="text-xs font-medium tracking-wide text-(--color-fg-muted) uppercase">
                                    Optional sharing
                                </legend>
                                <div className="flex flex-wrap gap-3">
                                    {GRANT_OPTIONS.map((option) => (
                                        <label
                                            key={option.value}
                                            className="flex items-center gap-2 text-sm text-(--color-fg)"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={classGrants.includes(option.value)}
                                                onChange={() => toggleGrant(option.value)}
                                                disabled={isPending}
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <Button type="button" disabled={isPending} onClick={() => handleAccept(invite.id)}>
                                {isPending ? 'Accepting…' : 'Accept membership'}
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </section>
    );
}
