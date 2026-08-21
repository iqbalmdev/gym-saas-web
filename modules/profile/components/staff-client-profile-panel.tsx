'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { formatProfileMeasure, profileGenderLabel } from '@/modules/profile/profile-labels';
import { useStaffClientProfile } from '@/modules/profile/profile-hooks';

export function StaffClientProfilePanel({ clientUserId }: { clientUserId: string }) {
    const { data, error, isPending } = useStaffClientProfile(clientUserId);

    if (isPending) {
        return <p className="text-sm text-(--color-fg-muted)">Loading profile…</p>;
    }

    if (error) {
        return (
            <p role="alert" className="text-sm text-(--color-danger)">
                {error.message}
            </p>
        );
    }

    if (!data || data.status === 'not_shared') {
        return <EmptyState title="Profile" description="Member has not shared profile details with this gym." />;
    }

    const profile = data.data;

    return (
        <section
            className="space-y-3 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="staff-profile-heading"
        >
            <div>
                <h2 id="staff-profile-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                    Profile
                </h2>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Only fields this member has granted. Ungranted fields stay blank.
                </p>
            </div>
            <dl className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                    <dt className="text-xs tracking-wide text-(--color-fg-muted) uppercase">Height</dt>
                    <dd className="mt-1 text-(--color-fg)">{formatProfileMeasure(profile.heightCm, 'cm')}</dd>
                </div>
                <div>
                    <dt className="text-xs tracking-wide text-(--color-fg-muted) uppercase">Weight</dt>
                    <dd className="mt-1 text-(--color-fg)">{formatProfileMeasure(profile.weightKg, 'kg')}</dd>
                </div>
                <div>
                    <dt className="text-xs tracking-wide text-(--color-fg-muted) uppercase">BMI</dt>
                    <dd className="mt-1 text-(--color-fg)">{profile.bmi ?? '—'}</dd>
                </div>
                <div>
                    <dt className="text-xs tracking-wide text-(--color-fg-muted) uppercase">Date of birth</dt>
                    <dd className="mt-1 text-(--color-fg)">{profile.dob ?? '—'}</dd>
                </div>
                <div>
                    <dt className="text-xs tracking-wide text-(--color-fg-muted) uppercase">Gender</dt>
                    <dd className="mt-1 text-(--color-fg)">
                        {profile.gender ? profileGenderLabel(profile.gender) : '—'}
                    </dd>
                </div>
                <div className="md:col-span-2">
                    <dt className="text-xs tracking-wide text-(--color-fg-muted) uppercase">Medical notes</dt>
                    <dd className="mt-1 text-(--color-fg)">{profile.medicalNotes ?? '—'}</dd>
                </div>
            </dl>
        </section>
    );
}
