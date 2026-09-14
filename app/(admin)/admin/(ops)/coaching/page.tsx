import Link from 'next/link';

export default function CoachingIndexPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg) md:text-3xl">Coaching</h1>
                <p className="mt-2 max-w-2xl text-sm text-(--color-fg-muted)">
                    Diet and workout template libraries, plus member assignment from the member detail page.
                </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
                <li>
                    <Link
                        href="/admin/coaching/diet-templates"
                        className="block rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel) hover:border-(--color-accent)"
                    >
                        <h2 className="font-semibold text-(--color-fg)">Diet templates</h2>
                        <p className="mt-1 text-sm text-(--color-fg-muted)">
                            Reusable meal plans for member assignment.
                        </p>
                    </Link>
                </li>
                <li>
                    <Link
                        href="/admin/coaching/workout-templates"
                        className="block rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel) hover:border-(--color-accent)"
                    >
                        <h2 className="font-semibold text-(--color-fg)">Workout templates</h2>
                        <p className="mt-1 text-sm text-(--color-fg-muted)">Exercise days for calendar scheduling.</p>
                    </Link>
                </li>
            </ul>
        </div>
    );
}
