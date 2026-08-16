'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getJson } from '@/lib/query/api-fetch';
import {
    acceptMembershipInviteAction,
    createMembershipInviteAction,
    revokeMembershipInviteAction,
    updateMyDataGrantsAction,
} from '@/modules/membership-invites/membership-invites-actions';
import { membershipInviteErrorMessage } from '@/modules/membership-invites/membership-invites-errors';
import type {
    MembershipPaymentStatus,
    OptionalClassGrant,
    OptionalProfileAttribute,
} from '@/modules/membership-invites/membership-invites-ports';
import { clientHomeKeys, membershipInvitesKeys } from '@/modules/membership-invites/membership-invites-query-keys';
import type {
    ClientHomeData,
    MembershipInvitesPageData,
} from '@/modules/membership-invites/membership-invites-queries';

/** Members page client hooks (ADR-0011). Mutations call the existing `'use server'` actions. */

export function useMembershipInvitesPage() {
    return useQuery({
        queryKey: membershipInvitesKeys.list(),
        queryFn: () =>
            getJson<MembershipInvitesPageData>(
                '/api/membership-invites',
                membershipInviteErrorMessage('NETWORK_OR_UNKNOWN'),
            ),
    });
}

export function useCreateMembershipInvite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: {
            inviteeName: string;
            invitedEmail: string;
            inviteePhone?: string;
            basePlanId: string;
            basePaymentStatus: MembershipPaymentStatus;
            addonPlanId?: string;
            addonPaymentStatus?: MembershipPaymentStatus;
        }) => {
            const result = await createMembershipInviteAction(input);
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: membershipInvitesKeys.all }),
    });
}

/**
 * Not optimistic: revoking flips `status` to a value the API decides, and the
 * row stays on screen either way — nothing to hide behind an optimistic write.
 */
export function useRevokeMembershipInvite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: { membershipInviteId: string }) => {
            const result = await revokeMembershipInviteAction(input);
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: membershipInvitesKeys.all }),
    });
}

/**
 * CLIENT member-home hooks (ADR-0011).
 *
 * Accepting an invite and saving grants both invalidate the whole `clientHome`
 * payload: accepting creates a membership, which makes that gym's data-sharing
 * panel appear alongside the invite's status change. Neither is optimistic —
 * the server decides membership status and which panels exist.
 */
export function useClientHome() {
    return useQuery({
        queryKey: clientHomeKeys.page(),
        queryFn: () => getJson<ClientHomeData>('/api/client/home', membershipInviteErrorMessage('NETWORK_OR_UNKNOWN')),
    });
}

export function useAcceptMembershipInvite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: {
            membershipInviteId: string;
            optionalProfileAttributes: OptionalProfileAttribute[];
            optionalClassGrants: OptionalClassGrant[];
        }) => {
            const result = await acceptMembershipInviteAction(input);
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: clientHomeKeys.all }),
    });
}

export function useUpdateMyDataGrants() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: {
            gymOrgId: string;
            optionalProfileAttributes: OptionalProfileAttribute[];
            optionalClassGrants: OptionalClassGrant[];
        }) => {
            const result = await updateMyDataGrantsAction(input);
            if (!result.ok) {
                throw new Error(result.message);
            }
            return result;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: clientHomeKeys.all }),
    });
}
