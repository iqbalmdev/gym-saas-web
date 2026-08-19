/**
 * Suspense fallback for MembersData — mirrors the invite form + invites list
 * + roster table shape so the layout doesn't shift when real data streams in.
 */
export function MembersPageSkeleton() {
    return (
        <div className="space-y-8" aria-hidden="true">
            <div className="space-y-6">
                <section className="animate-pulse rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-panel) md:p-6">
                    <div className="h-4 w-28 rounded bg-(--color-border)" />
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {[0, 1, 2, 3].map((field) => (
                            <div key={field} className="h-9 w-full rounded-md bg-(--color-border)" />
                        ))}
                    </div>
                    <div className="mt-4 h-9 w-40 rounded-md bg-(--color-border)" />
                </section>

                <section className="space-y-3">
                    <div className="h-4 w-40 animate-pulse rounded bg-(--color-border)" />
                    <ul className="divide-y divide-(--color-border) rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface)">
                        {[0, 1].map((row) => (
                            <li key={row} className="px-4 py-4">
                                <div className="h-3 w-40 animate-pulse rounded bg-(--color-border)" />
                                <div className="mt-2 h-3 w-56 animate-pulse rounded bg-(--color-border)" />
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <section className="space-y-3">
                <div className="h-4 w-28 animate-pulse rounded bg-(--color-border)" />
                <div className="h-32 animate-pulse rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface)" />
            </section>
        </div>
    );
}
