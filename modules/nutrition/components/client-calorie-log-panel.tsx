'use client';

import { useState, type ReactElement } from 'react';

import { Input } from '@/components/ui/input';
import { CalorieLogDay } from '@/modules/nutrition/components/calorie-log-day';
import type { FoodNameMap } from '@/modules/nutrition/nutrition-food-names';
import { useMyCalorieLog, useUnlogExtraFood } from '@/modules/nutrition/nutrition-hooks';
import type { CalorieLog } from '@/modules/nutrition/nutrition-ports';

type ClientCalorieLogPanelProps = {
    foodNames: FoodNameMap;
    /** RSC prefetch of the default day — keeps the diary visible on first paint. */
    initial?: CalorieLog;
};

export function ClientCalorieLogPanel({ foodNames, initial }: ClientCalorieLogPanelProps): ReactElement {
    /**
     * Undefined means "let the API pick today in Asia/Kolkata". Only an explicit
     * pick sends a date, so the default day never depends on the browser clock.
     */
    const [date, setDate] = useState<string | undefined>(undefined);

    const { data: calorieLog, error: listError, isPending } = useMyCalorieLog(date, date ? undefined : initial);
    const unlog = useUnlogExtraFood();

    const error = unlog.error?.message ?? listError?.message ?? null;

    return (
        <section
            className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="client-diary-heading"
        >
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 id="client-diary-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                        Food diary
                    </h2>
                    <p className="mt-1 text-sm text-(--color-fg-muted)">
                        Calories and macros by meal. Your gym reads this only if you enable Calories under Data sharing.
                    </p>
                </div>
                <label className="block w-44 text-sm">
                    <span className="font-medium text-(--color-fg)">Day</span>
                    <Input
                        className="mt-1 w-full"
                        type="date"
                        value={date ?? calorieLog?.logDate ?? ''}
                        onChange={(event) => setDate(event.target.value || undefined)}
                    />
                </label>
            </div>

            {error ? (
                <p role="alert" className="text-sm text-(--color-danger)">
                    {error}
                </p>
            ) : null}

            {isPending && !calorieLog ? (
                <p className="text-sm text-(--color-fg-muted)">Loading diary…</p>
            ) : !calorieLog ? (
                <p className="text-sm text-(--color-fg-muted)">Loading diary…</p>
            ) : (
                <CalorieLogDay
                    calorieLog={calorieLog}
                    foodNames={foodNames}
                    onRemoveItem={(itemId) => unlog.mutate(itemId)}
                    isRemoving={unlog.isPending}
                />
            )}
        </section>
    );
}
