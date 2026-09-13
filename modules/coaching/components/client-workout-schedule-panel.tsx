'use client';

import { useMemo, type ReactElement } from 'react';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    formatAdherencePercent,
    formatSetsReps,
    formatStreakDays,
    workoutScheduleKindLabel,
    workoutSessionSlotLabel,
} from '@/modules/coaching/coaching-labels';
import {
    useMyWorkoutSchedule,
    useMyWorkoutStreak,
    useToggleScheduleExerciseCompletion,
} from '@/modules/coaching/coaching-hooks';
import type { WorkoutSchedule, WorkoutStreak } from '@/modules/coaching/coaching-ports';

type ClientWorkoutSchedulePanelProps = {
    weekFrom: string;
    weekTo: string;
    initialSchedule?: WorkoutSchedule;
    initialStreak?: WorkoutStreak;
};

export function ClientWorkoutSchedulePanel({
    weekFrom,
    weekTo,
    initialSchedule,
    initialStreak,
}: ClientWorkoutSchedulePanelProps): ReactElement {
    const {
        data: schedule,
        error: scheduleError,
        isPending: schedulePending,
    } = useMyWorkoutSchedule(weekFrom, weekTo, initialSchedule);
    const { data: streak, error: streakError } = useMyWorkoutStreak(initialStreak);
    const toggle = useToggleScheduleExerciseCompletion();

    const error = toggle.error?.message ?? scheduleError?.message ?? streakError?.message ?? null;
    const writable = schedule?.writable ?? false;
    const days = useMemo(() => schedule?.days ?? [], [schedule?.days]);

    return (
        <div className="space-y-6">
            {streak ? (
                <section
                    className="rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
                    aria-labelledby="workout-streak-heading"
                >
                    <h2 id="workout-streak-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                        Streak
                    </h2>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                            <dt className="text-sm text-(--color-fg-muted)">Current</dt>
                            <dd className="text-xl font-semibold text-(--color-fg)">
                                {formatStreakDays(streak.currentStreak)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-(--color-fg-muted)">Longest</dt>
                            <dd className="text-xl font-semibold text-(--color-fg)">
                                {formatStreakDays(streak.longestStreak)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-(--color-fg-muted)">As of</dt>
                            <dd className="text-xl font-semibold text-(--color-fg)">{streak.asOf}</dd>
                        </div>
                    </dl>
                </section>
            ) : null}

            <section
                className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
                aria-labelledby="workout-schedule-heading"
            >
                <div>
                    <h2
                        id="workout-schedule-heading"
                        className="text-lg font-semibold tracking-tight text-(--color-fg)"
                    >
                        This week
                    </h2>
                    <p className="mt-1 text-sm text-(--color-fg-muted)">
                        {weekFrom} – {weekTo}. Tick exercises as you finish them.
                    </p>
                </div>

                {error ? (
                    <p role="alert" className="text-sm text-(--color-danger)">
                        {error}
                    </p>
                ) : null}

                {!writable ? (
                    <p className="text-sm text-(--color-fg-muted)">
                        Your coaching add-on has expired — history stays visible but you cannot log workouts.
                    </p>
                ) : null}

                {schedulePending && !schedule ? (
                    <p className="text-sm text-(--color-fg-muted)">Loading schedule…</p>
                ) : days.length === 0 ? (
                    <p className="text-sm text-(--color-fg-muted)">No workouts scheduled this week.</p>
                ) : (
                    <ul className="space-y-4" aria-label="Workout schedule">
                        {days.map((day) => {
                            const adherence = formatAdherencePercent(day.adherencePercent);
                            return (
                                <li
                                    key={day.scheduleDate}
                                    className="space-y-3 rounded-md border border-(--color-border) p-4"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-medium text-(--color-fg)">{day.scheduleDate}</h3>
                                        <Badge variant="outline">{workoutScheduleKindLabel(day.kind)}</Badge>
                                        {day.kind === 'TRAINING' && adherence !== null ? (
                                            <span className="text-sm text-(--color-fg-muted)">{adherence} done</span>
                                        ) : null}
                                        {day.dayDone ? <Badge variant="success">Day complete</Badge> : null}
                                    </div>

                                    {day.kind === 'REST' ? (
                                        <p className="text-sm text-(--color-fg-muted)">Recovery day — no exercises.</p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {day.sessions.map((session) => (
                                                <li key={session.id} className="space-y-2">
                                                    <p className="text-sm font-medium text-(--color-fg)">
                                                        {workoutSessionSlotLabel(session.slot)} · {session.title}
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {session.exercises.map((exercise) => {
                                                            const checkboxId = `workout-exercise-${exercise.id}`;
                                                            return (
                                                                <li
                                                                    key={exercise.id}
                                                                    className="flex items-start gap-3 rounded-md border border-(--color-border) px-3 py-2"
                                                                >
                                                                    <Checkbox
                                                                        id={checkboxId}
                                                                        checked={exercise.completed}
                                                                        disabled={!writable || toggle.isPending}
                                                                        aria-label={`Mark ${exercise.name} complete`}
                                                                        onCheckedChange={() =>
                                                                            toggle.mutate({
                                                                                itemId: exercise.id,
                                                                                completed: exercise.completed,
                                                                            })
                                                                        }
                                                                    />
                                                                    <label
                                                                        htmlFor={checkboxId}
                                                                        className="text-sm text-(--color-fg)"
                                                                    >
                                                                        {exercise.name}{' '}
                                                                        <span className="text-(--color-fg-muted)">
                                                                            (
                                                                            {formatSetsReps(
                                                                                exercise.sets,
                                                                                exercise.reps,
                                                                            )}
                                                                            )
                                                                        </span>
                                                                    </label>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
