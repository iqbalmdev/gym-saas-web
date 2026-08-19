/**
 * Suspense fallback for AttendanceData — mirrors the desk-mark form + list
 * shape so the layout doesn't shift when real data streams in.
 */
export function AttendanceAdminPanelSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            <section className="animate-pulse rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-panel) md:p-6">
                <div className="h-4 w-20 rounded bg-(--color-border)" />
                <div className="mt-4 space-y-3">
                    <div className="h-9 w-full rounded-md bg-(--color-border)" />
                    <div className="h-9 w-full rounded-md bg-(--color-border)" />
                    <div className="h-9 w-32 rounded-md bg-(--color-border)" />
                </div>
            </section>

            <section className="space-y-3">
                <div className="h-4 w-36 animate-pulse rounded bg-(--color-border)" />
                <ul className="divide-y divide-(--color-border) rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface)">
                    {[0, 1, 2].map((row) => (
                        <li key={row} className="flex items-center justify-between px-4 py-3">
                            <div className="h-3 w-32 animate-pulse rounded bg-(--color-border)" />
                            <div className="h-3 w-16 animate-pulse rounded bg-(--color-border)" />
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
