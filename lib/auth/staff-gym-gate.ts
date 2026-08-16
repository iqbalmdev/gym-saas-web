import { createAppServices } from '@/lib/api/composition';
import { getSession, isStaffSession, type SessionSnapshot } from '@/lib/auth/session';

/**
 * Auth → lane → tenant gate for **route handlers** (ADR-0011).
 *
 * The equivalent helper inside each `<module>-actions.ts` cannot be reused: those
 * files carry `'use server'`, so anything exported from them becomes a callable
 * Server Action rather than a plain function.
 *
 * Server-only by construction rather than by the `server-only` package (not a
 * dependency here): `getSession()` reads `next/headers`, which throws if this
 * is ever pulled into a Client Component.
 *
 * This resolves the tenant from the **session**, never from the request — a
 * `gym_org_id` arriving as a query param or body field is exactly the
 * cross-tenant hole `000-project-context.mdc` forbids. Handlers must take the
 * id from here and ignore anything the client sent.
 *
 * Grant checks (step 4 of `security-data-access.mdc`) stay with the API — this
 * only covers auth, lane, and tenant.
 */

export type StaffGymGate =
    | { ok: true; session: SessionSnapshot; gymOrgId: string }
    | { ok: false; status: 401 | 403; code: 'AUTHENTICATION_FAILED' | 'FORBIDDEN' };

export async function requireStaffGym(): Promise<StaffGymGate> {
    const session = await getSession();
    if (!session || !isStaffSession(session)) {
        return { ok: false, status: 401, code: 'AUTHENTICATION_FAILED' };
    }

    const { listGymOrgs } = createAppServices();
    const { gymOrgs } = await listGymOrgs({ accessToken: session.accessToken });
    const gymOrgId = gymOrgs[0]?.id;
    if (!gymOrgId) {
        return { ok: false, status: 403, code: 'FORBIDDEN' };
    }

    return { ok: true, session, gymOrgId };
}
