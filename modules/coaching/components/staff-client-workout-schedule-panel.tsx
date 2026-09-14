'use client';

import type { ReactElement } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import type { GrantAware } from '@/lib/domain/grant-aware';
import {
    formatAdherencePercent,
    formatSetsReps,
    formatStreakDays,
    workoutScheduleKindLabel,
    workoutSessionSlotLabel,
} from '@/modules/coaching/coaching-labels';
import { useStaffClientWorkoutSchedule, useStaffClientWorkoutStreak } from '@/modules/coaching/coaching-hooks';
import type { StaffWorkoutScheduleDay, WorkoutStreak } from '@/modules/coaching/coaching-ports';

type StaffClientWorkoutSchedulePanelProps = {
    clientUserId: string;
    weekFrom: string;
    weekTo: string;
    initialSchedule?: GrantAware<StaffWorkoutScheduleDay[]>;
    initialStreak?: GrantAware<WorkoutStreak>;
};

export function StaffClientWorkoutSchedulePanel({
    clientUserId,
    weekFrom,
    weekTo,
    initialSchedule,
    initialStreak,
}: StaffClientWorkoutSchedulePanelProps): ReactElement {
    const {
        data: scheduleResult,
        error: scheduleError,
        isPending: schedulePending,
    } = useStaffClientWorkoutSchedule(clientUserId, weekFrom, weekTo, initialSchedule);
    const { data: streakResult, error: streakError } = useStaffClientWorkoutStreak(clientUserId, initialStreak);

    const scheduleDenied = scheduleResult?.status === 'not_shared';
    const streakDenied = streakResult?.status === 'not_shared';

    if (schedulePending && !scheduleResult) {
        return <p className="text-sm text-(--color-fg-muted)">Loading workout schedule…</p>;
    }

    if (scheduleDenied) {
        return (
            <EmptyState
                title="Workout schedule"
                description="Member has not shared workout adherence with this gym. Ask them to enable Workout plans under Data sharing on their Home screen."
            />
        );
    }

    const days = scheduleResult?.status === 'ok' ? scheduleResult.data : [];
    const streak = streakResult?.status === 'ok' ? streakResult.data : null;
    const error = scheduleError?.message ?? streakError?.message ?? null;

    return (
        <div className="space-y-6">
            {streakDenied ? (
                <EmptyState
                    title="Workout streak"
                    description="Streak requires the member to share Workout plans with this gym."
                />
            ) : streak ? (
                <section
                    className="rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
                    aria-labelledby="staff-workout-streak-heading"
                >
                    <h2
                        id="staff-workout-streak-heading"
                        className="text-lg font-semibold tracking-tight text-(--color-fg)"
                    >
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
                aria-labelledby="staff-workout-schedule-heading"
            >
                <div>
                    <h2
                        id="staff-workout-schedule-heading"
                        className="text-lg font-semibold tracking-tight text-(--color-fg)"
                    >
                        Workout schedule
                    </h2>
                    <p className="mt-1 text-sm text-(--color-fg-muted)">
                        {weekFrom} – {weekTo}. Read-only — adherence appears when the member shares Workout plans.
                    </p>
                </div>

                {error ? (
                    <p role="alert" className="text-sm text-(--color-danger)">
                        {error}
                    </p>
                ) : null}

                {days.length === 0 ? (
                    <p className="text-sm text-(--color-fg-muted)">No workouts scheduled this week.</p>
                ) : (
                    <ul className="space-y-4" aria-label="Client workout schedule">
                        {days.map((day) => {
                            const adherence = formatAdherencePercent(day.adherencePercent ?? null);
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
                                        <p className="text-sm text-(--color-fg-muted)">Recovery day.</p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {day.sessions.map((session) => (
                                                <li key={session.id} className="space-y-2">
                                                    <p className="text-sm font-medium text-(--color-fg)">
                                                        {workoutSessionSlotLabel(session.slot)} · {session.title}
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {session.exercises.map((exercise) => (
                                                            <li key={exercise.id} className="text-sm text-(--color-fg)">
                                                                {exercise.name}{' '}
                                                                <span className="text-(--color-fg-muted)">
                                                                    ({formatSetsReps(exercise.sets, exercise.reps)})
                                                                    {exercise.completed ? ' · done' : ''}
                                                                </span>
                                                            </li>
                                                        ))}
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
