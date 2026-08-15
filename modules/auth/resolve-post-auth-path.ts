import type { AuthLane } from '@/modules/auth/auth-ports';

export type PostAuthRouteInput = {
    lane: AuthLane;
    gymOrgCount: number;
};

/**
 * Pure post-login destination — Staff without a GymOrg land on Settings
 * (create org / accept invite). Same path for new and returning Staff.
 */
export function resolvePostAuthPath(input: PostAuthRouteInput): string {
    if (input.lane === 'CLIENT') {
        return '/client';
    }
    if (input.gymOrgCount === 0) {
        return '/admin/settings';
    }
    return '/admin';
}
