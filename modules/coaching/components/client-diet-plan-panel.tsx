'use client';

import { useMemo, type ReactElement } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { formatQuantity } from '@/modules/nutrition/nutrition-labels';
import type { FoodNameMap } from '@/modules/nutrition/nutrition-food-names';
import { foodNameFor } from '@/modules/nutrition/nutrition-food-names';
import { mealSlotLabel } from '@/modules/coaching/coaching-labels';
import { useMyDietPlan, useToggleDietItemCompletion } from '@/modules/coaching/coaching-hooks';
import type { DietPlan } from '@/modules/coaching/coaching-ports';

type ClientDietPlanPanelProps = {
    foodNames: FoodNameMap;
    initial?: DietPlan | null;
};

export function ClientDietPlanPanel({ foodNames, initial }: ClientDietPlanPanelProps): ReactElement {
    const { data: dietPlan, error: listError, isPending } = useMyDietPlan(initial);
    const toggle = useToggleDietItemCompletion();

    const error = toggle.error?.message ?? listError?.message ?? null;
    const writable = dietPlan?.writable ?? false;

    const meals = useMemo(() => dietPlan?.meals ?? [], [dietPlan?.meals]);

    return (
        <section
            className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="client-diet-plan-heading"
        >
            <div>
                <h2 id="client-diet-plan-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                    Diet plan
                </h2>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Meals your trainer prescribed for today. Mark items eaten to log them on your diary.
                </p>
            </div>

            {error ? (
                <p role="alert" className="text-sm text-(--color-danger)">
                    {error}
                </p>
            ) : null}

            {isPending && dietPlan === undefined ? (
                <p className="text-sm text-(--color-fg-muted)">Loading diet plan…</p>
            ) : !dietPlan ? (
                <p className="text-sm text-(--color-fg-muted)">No diet plan assigned yet.</p>
            ) : (
                <div className="space-y-4">
                    <div>
                        <p className="font-medium text-(--color-fg)">{dietPlan.title}</p>
                        {dietPlan.notes ? (
                            <p className="mt-1 text-sm text-(--color-fg-muted)">{dietPlan.notes}</p>
                        ) : null}
                        {!writable ? (
                            <p className="mt-2 text-sm text-(--color-fg-muted)">
                                Your coaching add-on has expired — history stays visible but you cannot log meals.
                            </p>
                        ) : null}
                    </div>

                    <ul className="space-y-4" aria-label="Prescribed meals">
                        {meals.map((meal) => (
                            <li key={meal.id} className="space-y-2">
                                <h3 className="text-sm font-semibold text-(--color-fg)">
                                    {mealSlotLabel(meal.mealSlot)}
                                </h3>
                                {meal.items.length === 0 ? (
                                    <p className="text-sm text-(--color-fg-muted)">Nothing prescribed.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {meal.items.map((item) => {
                                            const foodName = foodNameFor(foodNames, item.foodItemId);
                                            const label = `${foodName} × ${formatQuantity(item.quantity)}`;
                                            const checkboxId = `diet-item-${item.id}`;
                                            return (
                                                <li
                                                    key={item.id}
                                                    className="flex items-start gap-3 rounded-md border border-(--color-border) px-3 py-2"
                                                >
                                                    <Checkbox
                                                        id={checkboxId}
                                                        checked={item.logged}
                                                        disabled={!writable || toggle.isPending}
                                                        aria-label={`Mark ${label} as eaten`}
                                                        onCheckedChange={() =>
                                                            toggle.mutate({ itemId: item.id, logged: item.logged })
                                                        }
                                                    />
                                                    <label htmlFor={checkboxId} className="text-sm text-(--color-fg)">
                                                        {label}
                                                        {item.logged ? (
                                                            <span className="ml-2 text-(--color-fg-muted)">Logged</span>
                                                        ) : null}
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
