import { PageHeaderSkeleton } from '@/components/admin/page-header-skeleton';
import { AttendanceAdminPanelSkeleton } from '@/modules/attendance/components/attendance-admin-panel-skeleton';

/**
 * Instant route-level fallback. Next prefetches this, so clicking
 * "Attendance" in the sidebar paints immediately instead of waiting for the
 * RSC response.
 */
export default function Loading() {
    return (
        <div className="space-y-6">
            <PageHeaderSkeleton />
            <AttendanceAdminPanelSkeleton />
        </div>
    );
}
