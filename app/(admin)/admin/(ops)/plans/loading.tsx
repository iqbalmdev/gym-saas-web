import { PageHeaderSkeleton } from '@/components/admin/page-header-skeleton';
import { PlansAdminPanelSkeleton } from '@/modules/plans/components/plans-admin-panel-skeleton';

/**
 * Instant route-level fallback. Next prefetches this, so clicking "Plans" in
 * the sidebar paints immediately instead of waiting for the RSC response.
 */
export default function Loading() {
    return (
        <div className="space-y-6">
            <PageHeaderSkeleton withTabs />
            <PlansAdminPanelSkeleton />
        </div>
    );
}
