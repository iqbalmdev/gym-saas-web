/**
 * Placeholder for an ops page's <h1> + description, used by `loading.tsx`
 * route fallbacks.
 *
 * Deliberately renders grey bars rather than the real copy: `loading.tsx`
 * would otherwise have to duplicate each page's title and description, which
 * drift apart the moment one side is edited.
 */
export function PageHeaderSkeleton({ withTabs = false }: { withTabs?: boolean }) {
    return (
        <div className="space-y-6" aria-hidden="true">
            <div>
                <div className="h-8 w-40 animate-pulse rounded bg-(--color-border) md:h-9" />
                <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-(--color-border)" />
                <div className="mt-2 h-4 w-2/3 max-w-md animate-pulse rounded bg-(--color-border)" />
            </div>

            {withTabs ? (
                <div className="flex flex-wrap gap-2">
                    {[0, 1, 2].map((tab) => (
                        <div key={tab} className="h-8 w-20 animate-pulse rounded-md bg-(--color-border)" />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
