import type {
    AcceptMembershipInviteInput,
    CreateMembershipInviteInput,
    MembershipInvitesReader,
    MembershipInvitesWriter,
    UpdateMyDataGrantsInput,
} from '@/lib/modules/membership-invites/membership-invites-ports';

export function createListMembershipInvites(deps: { membershipInvites: MembershipInvitesReader }) {
    return async function listMembershipInvites(input: { accessToken: string; gymOrgId: string }) {
        return deps.membershipInvites.list(input);
    };
}

export function createListMembershipInviteInbox(deps: { membershipInvites: MembershipInvitesReader }) {
    return async function listMembershipInviteInbox(input: { accessToken: string }) {
        return deps.membershipInvites.listInbox(input);
    };
}

export function createCreateMembershipInvite(deps: { membershipInvites: MembershipInvitesWriter }) {
    return async function createMembershipInvite(input: {
        accessToken: string;
        gymOrgId: string;
        body: CreateMembershipInviteInput;
    }) {
        return deps.membershipInvites.create(input);
    };
}

export function createRevokeMembershipInvite(deps: { membershipInvites: MembershipInvitesWriter }) {
    return async function revokeMembershipInvite(input: {
        accessToken: string;
        gymOrgId: string;
        membershipInviteId: string;
    }) {
        return deps.membershipInvites.revoke(input);
    };
}

export function createAcceptMembershipInvite(deps: { membershipInvites: MembershipInvitesWriter }) {
    return async function acceptMembershipInvite(input: {
        accessToken: string;
        membershipInviteId: string;
        body?: AcceptMembershipInviteInput;
    }) {
        return deps.membershipInvites.accept(input);
    };
}

export function createGetMyDataGrants(deps: { membershipInvites: MembershipInvitesReader }) {
    return async function getMyDataGrants(input: { accessToken: string; gymOrgId: string }) {
        return deps.membershipInvites.getMyDataGrants(input);
    };
}

export function createUpdateMyDataGrants(deps: { membershipInvites: MembershipInvitesWriter }) {
    return async function updateMyDataGrants(input: {
        accessToken: string;
        gymOrgId: string;
        body: UpdateMyDataGrantsInput;
    }) {
        return deps.membershipInvites.updateMyDataGrants(input);
    };
}
