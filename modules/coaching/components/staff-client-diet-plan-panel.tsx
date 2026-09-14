'use client';

import { useState, type ReactElement } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mealSlotLabel } from '@/modules/coaching/coaching-labels';
import {
    useAssignClientDietPlan,
    useDietPlanTemplates,
    useStaffClientDietPlan,
} from '@/modules/coaching/coaching-hooks';
import type { StaffDietPlan } from '@/modules/coaching/coaching-ports';

type StaffClientDietPlanPanelProps = {
    clientUserId: string;
    initial?: StaffDietPlan | null;
};

export function StaffClientDietPlanPanel({ clientUserId, initial }: StaffClientDietPlanPanelProps): ReactElement {
    const { data: dietPlan, error, isPending, isFetching, refetch } = useStaffClientDietPlan(clientUserId, initial);
    const { data: templates = [] } = useDietPlanTemplates();
    const assign = useAssignClientDietPlan(clientUserId);
    const [templateId, setTemplateId] = useState('');

    const message = error?.message ?? assign.error?.message ?? null;

    if (isPending && dietPlan === undefined) {
        return <p className="text-sm text-(--color-fg-muted)">Loading diet plan…</p>;
    }

    return (
        <section
            className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="staff-diet-plan-heading"
        >
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h2 id="staff-diet-plan-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                        Diet plan
                    </h2>
                    <p className="mt-1 text-sm text-(--color-fg-muted)">
                        Assigned meals for this member. Assign from a gym template — no DataGrant required to author.
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

            {message ? (
                <p role="alert" className="text-sm text-(--color-danger)">
                    {message}
                </p>
            ) : null}

            {!dietPlan ? (
                <p className="text-sm text-(--color-fg-muted)">No active diet plan assigned.</p>
            ) : (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-(--color-fg)">{dietPlan.title}</h3>
                        <Badge variant="outline">{dietPlan.status}</Badge>
                    </div>
                    <ul className="space-y-2" aria-label="Assigned meals">
                        {dietPlan.meals.map((meal) => (
                            <li key={meal.id} className="rounded-md border border-(--color-border) p-3">
                                <p className="text-sm font-medium text-(--color-fg)">{mealSlotLabel(meal.mealSlot)}</p>
                                <p className="text-sm text-(--color-fg-muted)">
                                    {meal.items.length} prescribed item{meal.items.length === 1 ? '' : 's'}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-wrap items-end gap-2 border-t border-(--color-border) pt-4">
                <div className="min-w-48 flex-1 space-y-1">
                    <label htmlFor="diet-template-select" className="text-sm text-(--color-fg-muted)">
                        Assign from template
                    </label>
                    <Select value={templateId} onValueChange={(value) => setTemplateId(value ?? '')}>
                        <SelectTrigger id="diet-template-select" className="w-full">
                            <SelectValue placeholder="Choose a template" />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    {template.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    type="button"
                    size="sm"
                    disabled={!templateId || assign.isPending}
                    onClick={() => assign.mutate(templateId)}
                >
                    Assign
                </Button>
            </div>
        </section>
    );
}
