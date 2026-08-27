/**
 * Playwright fixture adapter for the roster module (`GYM_SAAS_E2E_FIXTURES=1`).
 * Shared state lives in `lib/api/e2e/store.ts`; bound in `roster-services.ts`.
 */
import { ApiClientError } from '@/lib/api/errors';
import type { MembershipMutation, RosterMember, RosterReader, RosterWriter } from '@/modules/roster/roster-ports';
import { E2E_GYM_ID, e2eDataGrantsByGym, e2eGymTrainers, e2eRosterMembers } from '@/lib/api/e2e/store';

function toMembershipMutation(member: RosterMember): MembershipMutation {
    return {
        membershipId: member.membershipId,
        clientUserId: member.clientUserId,
        gymOrgId: member.gymOrgId,
        status: member.status,
        checkInBlocked: member.checkInBlocked,
        assignedTrainerId: member.assignedTrainerId,
        joinedAt: member.joinedAt,
        leftAt: member.leftAt,
        updatedAt: '2026-08-11T12:00:00.000Z',
    };
}

export function createE2eRosterAdapter(): RosterReader & RosterWriter {
    return {
        async listMembers({ gymOrgId, status, q }) {
            if (gymOrgId !== E2E_GYM_ID) {
                return { members: [] };
            }
            let items = [...e2eRosterMembers];
            if (status) {
                items = items.filter((member) => member.status === status);
            }
            if (q?.trim()) {
                const needle = q.trim().toLowerCase();
                items = items.filter(
                    (member) =>
                        member.clientName.toLowerCase().includes(needle) ||
                        member.clientEmail.toLowerCase().includes(needle) ||
                        (member.clientPhone ?? '').toLowerCase().includes(needle),
                );
            }
            return { members: items };
        },

        async listMyAssignedMembers({ gymOrgId, status, q }) {
            if (gymOrgId !== E2E_GYM_ID) {
                return { members: [] };
            }
            // E2E staff actor is the first gym trainer — scope to that profile id.
            const selfTrainerId = e2eGymTrainers[0]?.trainerProfileId ?? null;
            let items = e2eRosterMembers.filter((member) => member.assignedTrainerId === selfTrainerId);
            if (status) {
                items = items.filter((member) => member.status === status);
            }
            if (q?.trim()) {
                const needle = q.trim().toLowerCase();
                items = items.filter(
                    (member) =>
                        member.clientName.toLowerCase().includes(needle) ||
                        member.clientEmail.toLowerCase().includes(needle) ||
                        (member.clientPhone ?? '').toLowerCase().includes(needle),
                );
            }
            return { members: items };
        },

        async offboard({ gymOrgId, membershipId }) {
            const idx = e2eRosterMembers.findIndex(
                (item) => item.membershipId === membershipId && item.gymOrgId === gymOrgId,
            );
            if (idx < 0 || e2eRosterMembers[idx].status !== 'ACTIVE') {
                throw new ApiClientError({
                    code: 'NOT_FOUND',
                    message: 'Active membership not found',
                    status: 404,
                });
            }
            const updated: RosterMember = {
                ...e2eRosterMembers[idx],
                status: 'INACTIVE',
                leftAt: '2026-08-11T12:00:00.000Z',
            };
            e2eRosterMembers[idx] = updated;
            e2eDataGrantsByGym.delete(gymOrgId);
            return { membership: toMembershipMutation(updated) };
        },

        async setCheckInBlock({ gymOrgId, membershipId, blocked }) {
            const idx = e2eRosterMembers.findIndex(
                (item) => item.membershipId === membershipId && item.gymOrgId === gymOrgId,
            );
            if (idx < 0) {
                throw new ApiClientError({
                    code: 'NOT_FOUND',
                    message: 'Active membership not found',
                    status: 404,
                });
            }
            if (e2eRosterMembers[idx].status !== 'ACTIVE') {
                throw new ApiClientError({
                    code: 'CLIENT_MEMBERSHIP_INVALID_TRANSITION',
                    message: 'Cannot block check-in an inactive membership',
                    status: 422,
                });
            }
            const updated: RosterMember = {
                ...e2eRosterMembers[idx],
                checkInBlocked: blocked,
            };
            e2eRosterMembers[idx] = updated;
            return { membership: toMembershipMutation(updated) };
        },

        async assignTrainer({ gymOrgId, membershipId, trainerProfileId }) {
            const idx = e2eRosterMembers.findIndex(
                (item) => item.membershipId === membershipId && item.gymOrgId === gymOrgId,
            );
            if (idx < 0) {
                throw new ApiClientError({
                    code: 'NOT_FOUND',
                    message: 'Active membership not found',
                    status: 404,
                });
            }
            if (e2eRosterMembers[idx].status !== 'ACTIVE') {
                throw new ApiClientError({
                    code: 'CLIENT_MEMBERSHIP_INVALID_TRANSITION',
                    message: 'Cannot assign a trainer to an inactive membership',
                    status: 422,
                });
            }
            const trainer = e2eGymTrainers.find((item) => item.trainerProfileId === trainerProfileId);
            if (!trainer) {
                throw new ApiClientError({
                    code: 'NOT_FOUND',
                    message: 'Trainer not found at this gym',
                    status: 404,
                });
            }
            const updated: RosterMember = {
                ...e2eRosterMembers[idx],
                assignedTrainerId: trainer.trainerProfileId,
            };
            e2eRosterMembers[idx] = updated;
            return { membership: toMembershipMutation(updated) };
        },
    };
}
