'use client';

import { useMemo, useState, type ReactElement } from 'react';
import { Copy, Plus, Search, Trash2 } from 'lucide-react';

import { ConfirmActionDialog } from '@/components/admin/confirm-action-dialog';
import { ErrorNotice } from '@/components/admin/error-notice';
import { WorkQueue, WorkQueueLayout, WorkQueueRow } from '@/components/admin/work-queue-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatSetsReps } from '@/modules/coaching/coaching-labels';
import {
    useCreateWorkoutPlanTemplate,
    useDeleteWorkoutPlanTemplate,
    useDuplicateWorkoutPlanTemplate,
    useWorkoutPlanTemplates,
} from '@/modules/coaching/coaching-hooks';
import type { WorkoutPlanTemplate } from '@/modules/coaching/coaching-ports';

/** Minimal Push A template using the seeded bench press catalog id. */
const PUSH_A_BODY = {
    title: 'Push A',
    notes: null,
    exercises: [
        {
            exerciseItemId: 'e0e00000-0000-4000-8000-000000000001',
            sets: 3,
            reps: '8-10',
            notes: null,
        },
    ],
};

type WorkoutTemplatesAdminPanelProps = {
    gymName: string;
};

export function WorkoutTemplatesAdminPanel({ gymName }: WorkoutTemplatesAdminPanelProps): ReactElement {
    const { data: templates = [], error: listError } = useWorkoutPlanTemplates();
    const createTemplate = useCreateWorkoutPlanTemplate();
    const deleteTemplate = useDeleteWorkoutPlanTemplate();
    const duplicateTemplate = useDuplicateWorkoutPlanTemplate();

    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) {
            return templates;
        }
        return templates.filter((row) => row.title.toLowerCase().includes(needle));
    }, [templates, query]);

    const selected: WorkoutPlanTemplate | null = visible.find((row) => row.id === selectedId) ?? visible[0] ?? null;

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
                                placeholder="Search workout templates"
                                aria-label="Search workout templates"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            disabled={actionsPending}
                            onClick={() => createTemplate.mutate(PUSH_A_BODY)}
                        >
                            <Plus aria-hidden />
                            New Push A
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
                                <p className="text-sm font-medium text-(--color-fg)">No workout templates yet</p>
                                <p className="mt-1 text-sm text-(--color-fg-muted)">
                                    Create a minimal Push A template to schedule client workouts.
                                </p>
                            </div>
                        ) : (
                            <WorkQueue label="Workout templates">
                                {visible.map((template) => (
                                    <WorkQueueRow
                                        key={template.id}
                                        tone="neutral"
                                        selected={template.id === selected?.id}
                                        onSelect={() => setSelectedId(template.id)}
                                        selectLabel={`Open ${template.title}`}
                                        title={template.title}
                                        meta={`${template.exercises.length} exercise${template.exercises.length === 1 ? '' : 's'}`}
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

                            <ul className="space-y-2" aria-label="Exercises in template">
                                {selected.exercises.map((exercise) => (
                                    <li
                                        key={exercise.id}
                                        className="rounded-md border border-(--color-border) px-3 py-2 text-sm text-(--color-fg)"
                                    >
                                        {exercise.name ?? 'Exercise'}{' '}
                                        {exercise.sets !== null && exercise.reps !== null ? (
                                            <span className="text-(--color-fg-muted)">
                                                ({formatSetsReps(exercise.sets, exercise.reps)})
                                            </span>
                                        ) : null}
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
                                    title="Delete workout template?"
                                    description="Scheduled days already snapshotted keep their exercises. This only removes the library copy."
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
