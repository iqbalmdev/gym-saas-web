import { createAppServices } from '@/lib/api/composition';
import { ApiClientError } from '@/lib/api/errors';
import { getSession, isClientSession, type SessionSnapshot } from '@/lib/auth/session';
import { gymOrgErrorMessage } from '@/modules/gym-orgs/gym-orgs-errors';

/**
 * Auth → lane → tenant gate for CLIENT gym-scoped route handlers (ADR-0011).
 *
 * Resolves `gymOrgId` from GET /me/gym (ACTIVE membership) — never from the
 * request. Coaching reads and mutations share this gate with the BFF routes.
 */
export type ClientGymGate =
    { ok: true; session: SessionSnapshot; gymOrgId: string } | { ok: false; status: number; code: string };

export async function requireClientGym(): Promise<ClientGymGate> {
    const session = await getSession();
    if (!session || !isClientSession(session)) {
        return { ok: false, status: 401, code: 'AUTHENTICATION_FAILED' };
    }

    try {
        const { getMyGym } = createAppServices();
        const { gymOrg } = await getMyGym({ accessToken: session.accessToken });
        return { ok: true, session, gymOrgId: gymOrg.id };
    } catch (error) {
        if (error instanceof ApiClientError) {
            const status =
                error.status === 404 ? 404 : error.status === 403 ? 403 : error.status === 0 ? 502 : error.status;
            return { ok: false, status, code: error.code };
        }
        return { ok: false, status: 500, code: 'NETWORK_OR_UNKNOWN' };
    }
}

export function clientGymGateMessage(code: string): string {
    if (code === 'NOT_FOUND') {
        return 'You need an active gym membership before coaching plans appear here.';
    }
    return gymOrgErrorMessage(code);
}
