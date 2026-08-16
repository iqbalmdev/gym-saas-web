/**
 * Suspense fallback for RenewalsData — mirrors the renewals-due list shape
 * so the layout doesn't shift when real data streams in.
 */
export function RenewalsAdminPanelSkeleton() {
    return (
        <div className="space-y-3" aria-hidden="true">
            <div className="h-4 w-28 animate-pulse rounded bg-(--color-border)" />
            <ul className="divide-y divide-(--color-border) rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface)">
                {[0, 1, 2].map((row) => (
                    <li
                        key={row}
                        className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
                    >
                        <div className="space-y-2">
                            <div className="h-3 w-40 animate-pulse rounded bg-(--color-border)" />
                            <div className="h-3 w-56 animate-pulse rounded bg-(--color-border)" />
                        </div>
                        <div className="flex gap-2">
                            {[0, 1, 2].map((btn) => (
                                <div key={btn} className="h-8 w-24 animate-pulse rounded-md bg-(--color-border)" />
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
