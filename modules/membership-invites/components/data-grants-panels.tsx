'use client';

import { DataGrantsPanel } from '@/modules/membership-invites/components/data-grants-panel';
import { useClientHome } from '@/modules/membership-invites/membership-invites-hooks';

/**
 * One data-sharing panel per gym where this client has an ACTIVE membership.
 *
 * Reads the same `clientHome` query as the invite inbox — TanStack dedupes, so
 * this is one round trip, not two. Keyed by `gymOrgId` so accepting an invite
 * mounts a fresh panel with that gym's grants rather than reusing another's
 * checkbox state.
 */
export function DataGrantsPanels() {
    const { data } = useClientHome();
    const panels = data?.grantsPanels ?? [];

    return (
        <>
            {panels.map((panel) => (
                <DataGrantsPanel
                    key={panel.gymOrgId}
                    gymOrgId={panel.gymOrgId}
                    gymName={panel.gymName}
                    dataGrants={panel.dataGrants}
                />
            ))}
        </>
    );
}
