import { PageHeaderSkeleton } from '@/components/admin/page-header-skeleton';
import { RenewalsAdminPanelSkeleton } from '@/modules/subscriptions/components/renewals-admin-panel-skeleton';

/**
 * Instant route-level fallback. Next prefetches this, so clicking "Renewals"
 * in the sidebar paints immediately instead of waiting for the RSC response.
 */
export default function Loading() {
    return (
        <div className="space-y-6">
            <PageHeaderSkeleton />
            <RenewalsAdminPanelSkeleton />
        </div>
    );
}
