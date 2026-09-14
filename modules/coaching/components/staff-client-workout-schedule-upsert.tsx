'use client';

import { useState, type FormEvent, type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpsertClientWorkoutSchedule, useWorkoutPlanTemplates } from '@/modules/coaching/coaching-hooks';
import type { WorkoutScheduleKind } from '@/modules/coaching/coaching-ports';

type StaffClientWorkoutScheduleUpsertProps = {
    clientUserId: string;
};

export function StaffClientWorkoutScheduleUpsert({
    clientUserId,
}: StaffClientWorkoutScheduleUpsertProps): ReactElement {
    const { data: templates = [] } = useWorkoutPlanTemplates();
    const upsert = useUpsertClientWorkoutSchedule(clientUserId);

    const [date, setDate] = useState('');
    const [kind, setKind] = useState<WorkoutScheduleKind>('TRAINING');
    const [morningTemplateId, setMorningTemplateId] = useState('');
    const [eveningTemplateId, setEveningTemplateId] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const entry =
            kind === 'REST'
                ? { date, kind }
                : {
                      date,
                      kind,
                      ...(morningTemplateId ? { morningTemplateId } : {}),
                      ...(eveningTemplateId ? { eveningTemplateId } : {}),
                  };
        upsert.mutate([entry], {
            onSuccess: () => {
                setDate('');
                setMorningTemplateId('');
                setEveningTemplateId('');
            },
        });
    }

    const trainingInvalid = kind === 'TRAINING' && !morningTemplateId && !eveningTemplateId;

    return (
        <section
            className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="staff-schedule-upsert-heading"
        >
            <div>
                <h2
                    id="staff-schedule-upsert-heading"
                    className="text-lg font-semibold tracking-tight text-(--color-fg)"
                >
                    Schedule a day
                </h2>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Pick a date and either rest or training with morning/evening workout templates.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                    <label htmlFor="schedule-date" className="text-sm text-(--color-fg-muted)">
                        Date
                    </label>
                    <Input
                        id="schedule-date"
                        type="date"
                        required
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="schedule-kind" className="text-sm text-(--color-fg-muted)">
                        Day type
                    </label>
                    <Select value={kind} onValueChange={(value) => setKind(value as WorkoutScheduleKind)}>
                        <SelectTrigger id="schedule-kind" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="REST">Rest</SelectItem>
                            <SelectItem value="TRAINING">Training</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {kind === 'TRAINING' ? (
                    <>
                        <div className="space-y-1">
                            <label htmlFor="morning-template" className="text-sm text-(--color-fg-muted)">
                                Morning template
                            </label>
                            <Select
                                value={morningTemplateId}
                                onValueChange={(value) => setMorningTemplateId(value ?? '')}
                            >
                                <SelectTrigger id="morning-template" className="w-full">
                                    <SelectValue placeholder="Optional" />
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

                        <div className="space-y-1">
                            <label htmlFor="evening-template" className="text-sm text-(--color-fg-muted)">
                                Evening template
                            </label>
                            <Select
                                value={eveningTemplateId}
                                onValueChange={(value) => setEveningTemplateId(value ?? '')}
                            >
                                <SelectTrigger id="evening-template" className="w-full">
                                    <SelectValue placeholder="Optional" />
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
                    </>
                ) : null}

                <div className="sm:col-span-2">
                    {upsert.error ? (
                        <p role="alert" className="mb-2 text-sm text-(--color-danger)">
                            {upsert.error.message}
                        </p>
                    ) : null}
                    <Button type="submit" size="sm" disabled={upsert.isPending || trainingInvalid}>
                        {upsert.isPending ? 'Saving…' : 'Save day'}
                    </Button>
                </div>
            </form>
        </section>
    );
}
