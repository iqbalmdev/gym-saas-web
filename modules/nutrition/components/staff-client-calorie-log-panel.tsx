'use client';

import type { ReactElement } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import type { GrantAware } from '@/lib/domain/grant-aware';
import { CalorieLogDay } from '@/modules/nutrition/components/calorie-log-day';
import type { FoodNameMap } from '@/modules/nutrition/nutrition-food-names';
import { useStaffClientCalorieLog } from '@/modules/nutrition/nutrition-hooks';
import type { CalorieLog } from '@/modules/nutrition/nutrition-ports';

type StaffClientCalorieLogPanelProps = {
    clientUserId: string;
    foodNames: FoodNameMap;
    /** RSC prefetch — keeps the diary visible even if the client refetch lags. */
    initial?: GrantAware<CalorieLog>;
};

export function StaffClientCalorieLogPanel({
    clientUserId,
    foodNames,
    initial,
}: StaffClientCalorieLogPanelProps): ReactElement {
    const { data, error, isPending, isFetching, refetch } = useStaffClientCalorieLog(clientUserId, undefined, initial);

    if (isPending && !data) {
        return <p className="text-sm text-(--color-fg-muted)">Loading food diary…</p>;
    }

    if (error && !data) {
        return (
            <div className="space-y-2" role="alert">
                <p className="text-sm text-(--color-danger)">{error.message}</p>
                <button
                    type="button"
                    className="text-sm text-(--color-fg) underline-offset-4 hover:underline"
                    onClick={() => void refetch()}
                >
                    Try again
                </button>
            </div>
        );
    }

    // Missing cache is loading — never treat as "not shared".
    if (!data) {
        return <p className="text-sm text-(--color-fg-muted)">Loading food diary…</p>;
    }

    if (data.status === 'not_shared') {
        return (
            <EmptyState
                title="Food diary"
                description="Member has not shared their food diary with this gym. Ask them to enable Calories under Data sharing on their Home screen."
            />
        );
    }

    return (
        <section
            className="space-y-3 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="staff-diary-heading"
        >
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h2 id="staff-diary-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                        Food diary
                    </h2>
                    <p className="mt-1 text-sm text-(--color-fg-muted)">
                        Shared calories and macros for {data.data.logDate}. Read-only — only the member edits their
                        diary.
                    </p>
                </div>
                <button
                    type="button"
                    className="text-sm text-(--color-fg-muted) underline-offset-4 hover:text-(--color-fg) hover:underline"
                    onClick={() => void refetch()}
                    disabled={isFetching}
                >
                    {isFetching ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            <CalorieLogDay calorieLog={data.data} foodNames={foodNames} />
        </section>
    );
}
