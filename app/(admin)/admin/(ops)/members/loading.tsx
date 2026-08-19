import { PageHeaderSkeleton } from '@/components/admin/page-header-skeleton';
import { MembersPageSkeleton } from '@/modules/membership-invites/components/members-page-skeleton';

/**
 * Instant route-level fallback. Next prefetches this, so clicking "Members"
 * in the sidebar paints immediately instead of waiting for the RSC response.
 */
export default function Loading() {
    return (
        <div className="space-y-6">
            <PageHeaderSkeleton />
            <MembersPageSkeleton />
        </div>
    );
}
