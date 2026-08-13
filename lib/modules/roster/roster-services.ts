import type { HttpClient } from '@/lib/api/client';
import { areE2eFixturesEnabled, createE2eRosterAdapter } from '@/lib/api/e2e-fixtures';
import { createRosterAdapter } from '@/lib/modules/roster/roster-adapter';
import {
    createListRosterMembers,
    createOffboardMember,
    createSetCheckInBlock,
} from '@/lib/modules/roster/roster-use-cases';

/** Binds the roster port to its adapter and use-cases (ADR-0007). */
export function rosterServices(http: HttpClient) {
    const roster = areE2eFixturesEnabled() ? createE2eRosterAdapter() : createRosterAdapter(http);
    return {
        roster,
        listRosterMembers: createListRosterMembers({ roster }),
        offboardMember: createOffboardMember({ roster }),
        setCheckInBlock: createSetCheckInBlock({ roster }),
    };
}
