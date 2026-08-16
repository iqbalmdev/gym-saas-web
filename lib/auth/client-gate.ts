import { getSession, isClientSession, type SessionSnapshot } from '@/lib/auth/session';

/**
 * Auth + lane gate for **CLIENT** route handlers (ADR-0011), mirroring
 * `requireStaffGym` for the Staff lane.
 *
 * No tenant step: CLIENT-owned data is scoped by the access token itself, and
 * a client may hold memberships at several gyms. Handlers that take a
 * `gymOrgId` must still let the API decide whether this client has an ACTIVE
 * membership there — never infer access from the id being present.
 *
 * Server-only by construction: `getSession()` reads `next/headers`, which
 * throws if this is pulled into a Client Component.
 */
export type ClientGate =
    { ok: true; session: SessionSnapshot } | { ok: false; status: 401; code: 'AUTHENTICATION_FAILED' };

export async function requireClientSession(): Promise<ClientGate> {
    const session = await getSession();
    if (!session || !isClientSession(session)) {
        return { ok: false, status: 401, code: 'AUTHENTICATION_FAILED' };
    }
    return { ok: true, session };
}
