import type { RosterReader, RosterWriter } from "@/lib/modules/roster/roster-ports";

export function createListRosterMembers(deps: { roster: RosterReader }) {
  return async function listRosterMembers(input: {
    accessToken: string;
    gymOrgId: string;
    status?: "ACTIVE" | "INACTIVE";
    q?: string;
  }) {
    return deps.roster.listMembers(input);
  };
}

export function createOffboardMember(deps: { roster: RosterWriter }) {
  return async function offboardMember(input: {
    accessToken: string;
    gymOrgId: string;
    membershipId: string;
  }) {
    return deps.roster.offboard(input);
  };
}

export function createSetCheckInBlock(deps: { roster: RosterWriter }) {
  return async function setCheckInBlock(input: {
    accessToken: string;
    gymOrgId: string;
    membershipId: string;
    blocked: boolean;
  }) {
    return deps.roster.setCheckInBlock(input);
  };
}
