/**
 * Suspense fallback for SettingsData — a generic panel shape, since the
 * real content branches on whether the Staff session already has a gym
 * (invites admin) or not (inbox + create-gym), and that branch itself is
 * part of what's loading.
 */
export function SettingsPageSkeleton() {
    return (
        <div className="space-y-8" aria-hidden="true">
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-(--color-border)" />
            <section className="animate-pulse space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)">
                <div className="h-4 w-40 rounded bg-(--color-border)" />
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-9 w-full rounded-md bg-(--color-border)" />
                    <div className="h-9 w-full rounded-md bg-(--color-border)" />
                </div>
                <div className="h-9 w-28 rounded-md bg-(--color-border)" />
            </section>
        </div>
    );
}
