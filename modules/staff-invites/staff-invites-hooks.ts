'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getJson } from '@/lib/query/api-fetch';
import { createStaffInviteAction, revokeStaffInviteAction } from '@/modules/staff-invites/staff-invites-actions';
import { staffInviteErrorMessage } from '@/modules/staff-invites/staff-invites-errors';
import type { StaffInvite, StaffInviteTargetRole } from '@/modules/staff-invites/staff-invites-ports';
import { staffInvitesKeys } from '@/modules/staff-invites/staff-invites-query-keys';

/**
 * Staff-invite client hooks (ADR-0011) — for the **gym-admin** list only.
 *
 * Accepting an invite and creating a gym stay on `router.refresh()`: they
 * change the session's gym affiliation, which decides the Admin shell's mode
 * (settings-only vs full) in `app/(admin)/admin/layout.tsx`. Cache
 * invalidation cannot re-render a layout, so those two must keep going
 * through the router.
 */

export function useGymStaffInvites() {
    return useQuery({
        queryKey: staffInvitesKeys.gymList(),
        queryFn: async () => {
            const { invites } = await getJson<{ invites: StaffInvite[] }>(
                '/api/staff-invites',
                staffInviteErrorMessage('NETWORK_OR_UNKNOWN'),
            );
            return invites;
        },
    });
}

export function useCreateStaffInvite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: { staffCode: string; targetRole: StaffInviteTargetRole }) => {
            const result = await createStaffInviteAction(input);
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: staffInvitesKeys.all }),
    });
}

export function useRevokeStaffInvite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: { inviteId: string }) => {
            const result = await revokeStaffInviteAction(input);
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: staffInvitesKeys.all }),
    });
}
