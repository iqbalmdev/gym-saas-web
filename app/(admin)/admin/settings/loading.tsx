import { SettingsPageSkeleton } from '@/modules/staff-invites/components/settings-page-skeleton';

/**
 * Instant route-level fallback. Next prefetches this, so clicking "Settings"
 * in the sidebar paints immediately instead of waiting for the RSC response.
 *
 * The <h1> is static in the page (no data dependency), so unlike the ops
 * routes this only needs the panel skeleton beneath a title placeholder.
 */
export default function Loading() {
    return (
        <div className="space-y-8">
            <div className="h-8 w-40 animate-pulse rounded bg-(--color-border) md:h-9" aria-hidden="true" />
            <SettingsPageSkeleton />
        </div>
    );
}
