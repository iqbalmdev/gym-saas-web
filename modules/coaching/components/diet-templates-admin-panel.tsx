'use client';

import { useMemo, useState, type ReactElement } from 'react';
import { Copy, Plus, Search, Trash2 } from 'lucide-react';

import { ConfirmActionDialog } from '@/components/admin/confirm-action-dialog';
import { ErrorNotice } from '@/components/admin/error-notice';
import { WorkQueue, WorkQueueLayout, WorkQueueRow } from '@/components/admin/work-queue-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mealSlotLabel } from '@/modules/coaching/coaching-labels';
import {
    useCreateDietPlanTemplate,
    useDeleteDietPlanTemplate,
    useDietPlanTemplates,
    useDuplicateDietPlanTemplate,
} from '@/modules/coaching/coaching-hooks';
import type { DietPlanTemplate } from '@/modules/coaching/coaching-ports';

/** Seeded Idli breakfast — matches Postman food/serving examples. */
const IDLI_BREAKFAST_BODY = {
    title: 'Idli breakfast',
    notes: null,
    meals: [
        {
            mealSlot: 'BREAKFAST' as const,
            items: [
                {
                    foodItemId: 'f00d0000-0000-4000-8000-000000000001',
                    servingId: 'f00d5e04-0000-4000-8000-000000010003',
                    quantity: 2,
                },
            ],
        },
    ],
};

type DietTemplatesAdminPanelProps = {
    gymName: string;
};

export function DietTemplatesAdminPanel({ gymName }: DietTemplatesAdminPanelProps): ReactElement {
    const { data: templates = [], error: listError } = useDietPlanTemplates();
    const createTemplate = useCreateDietPlanTemplate();
    const deleteTemplate = useDeleteDietPlanTemplate();
    const duplicateTemplate = useDuplicateDietPlanTemplate();

    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) {
            return templates;
        }
        return templates.filter((row) => row.title.toLowerCase().includes(needle));
    }, [templates, query]);

    const selected: DietPlanTemplate | null = visible.find((row) => row.id === selectedId) ?? visible[0] ?? null;

    const message =
        listError?.message ??
        createTemplate.error?.message ??
        deleteTemplate.error?.message ??
        duplicateTemplate.error?.message ??
        null;

    const actionsPending = createTemplate.isPending || deleteTemplate.isPending || duplicateTemplate.isPending;

    return (
        <div className="space-y-4">
            <ErrorNotice message={message} />

            <WorkQueueLayout
                selectedKey={selected?.id ?? null}
                railLabel="Selected template"
                toolbar={
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative min-w-48 flex-1">
                            <Search
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-(--color-fg-muted)"
                            />
                            <Input
                                type="search"
                                className="pl-8"
                                placeholder="Search diet templates"
                                aria-label="Search diet templates"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            disabled={actionsPending}
                            onClick={() => createTemplate.mutate(IDLI_BREAKFAST_BODY)}
                        >
                            <Plus aria-hidden />
                            New Idli breakfast
                        </Button>
                    </div>
                }
                queue={
                    <div className="space-y-2">
                        <p className="px-1 text-xs text-(--color-fg-muted)">
                            {gymName} · {templates.length} {templates.length === 1 ? 'template' : 'templates'}
                        </p>
                        {visible.length === 0 ? (
                            <div className="rounded-(--radius-panel) border border-(--color-border)/80 bg-(--color-surface) p-8 text-center shadow-(--shadow-panel)">
                                <p className="text-sm font-medium text-(--color-fg)">No diet templates yet</p>
                                <p className="mt-1 text-sm text-(--color-fg-muted)">
                                    Create the seeded Idli breakfast template to start assigning diets.
                                </p>
                            </div>
                        ) : (
                            <WorkQueue label="Diet templates">
                                {visible.map((template) => (
                                    <WorkQueueRow
                                        key={template.id}
                                        tone="neutral"
                                        selected={template.id === selected?.id}
                                        onSelect={() => setSelectedId(template.id)}
                                        selectLabel={`Open ${template.title}`}
                                        title={template.title}
                                        meta={`${template.meals.length} meal${template.meals.length === 1 ? '' : 's'}`}
                                    />
                                ))}
                            </WorkQueue>
                        )}
                    </div>
                }
                rail={
                    selected ? (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight text-(--color-fg)">
                                    {selected.title}
                                </h2>
                                {selected.notes ? (
                                    <p className="mt-1 text-sm text-(--color-fg-muted)">{selected.notes}</p>
                                ) : null}
                            </div>

                            <ul className="space-y-3" aria-label="Meals in template">
                                {selected.meals.map((meal) => (
                                    <li
                                        key={meal.id}
                                        className="space-y-1 rounded-md border border-(--color-border) p-3"
                                    >
                                        <Badge variant="outline">{mealSlotLabel(meal.mealSlot)}</Badge>
                                        <p className="text-sm text-(--color-fg-muted)">
                                            {meal.items.length} item{meal.items.length === 1 ? '' : 's'}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={actionsPending}
                                    onClick={() => duplicateTemplate.mutate(selected.id)}
                                >
                                    <Copy aria-hidden />
                                    Duplicate
                                </Button>
                                <ConfirmActionDialog
                                    trigger={<Button type="button" size="sm" variant="destructive" />}
                                    title="Delete diet template?"
                                    description="Members already assigned keep their snapshot. This only removes the library copy."
                                    confirmLabel="Delete template"
                                    disabled={actionsPending}
                                    onConfirm={() => deleteTemplate.mutate(selected.id)}
                                >
                                    <Trash2 aria-hidden />
                                    Delete
                                </ConfirmActionDialog>
                            </div>
                        </div>
                    ) : null
                }
            />
        </div>
    );
}
