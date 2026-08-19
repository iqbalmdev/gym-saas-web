/**
 * Suspense fallback for PlansData — mirrors the add-plan form + catalog list
 * shape so the layout doesn't shift when real data streams in.
 */
export function PlansAdminPanelSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            <section className="animate-pulse rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)">
                <div className="h-4 w-20 rounded bg-(--color-border)" />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((field) => (
                        <div key={field} className="h-9 w-full rounded-md bg-(--color-border)" />
                    ))}
                </div>
                <div className="mt-4 h-9 w-32 rounded-md bg-(--color-border)" />
            </section>

            <div className="rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-panel)">
                <div className="border-b border-(--color-border)/80 px-5 py-3">
                    <div className="h-4 w-32 animate-pulse rounded bg-(--color-border)" />
                </div>
                <ul className="divide-y divide-(--color-border)/70">
                    {[0, 1, 2].map((row) => (
                        <li key={row} className="flex items-center justify-between px-5 py-4">
                            <div className="h-3 w-40 animate-pulse rounded bg-(--color-border)" />
                            <div className="h-3 w-20 animate-pulse rounded bg-(--color-border)" />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
