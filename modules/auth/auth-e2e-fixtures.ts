/**
 * Playwright fixture adapter for the auth module (`GYM_SAAS_E2E_FIXTURES=1`).
 * Shared state lives in `lib/api/e2e/store.ts`; bound in `auth-services.ts`.
 */
import type { AuthGateway, AuthLane, AuthUser } from '@/modules/auth/auth-ports';
import {
    E2E_CLIENT_TOKEN,
    E2E_STAFF_TOKEN_NO_GYM,
    E2E_STAFF_TOKEN_WITH_GYM,
    e2eAffiliatedTokens,
    e2eOwnerTokens,
} from '@/lib/api/e2e/store';

function isNewUserEmail(email: string): boolean {
    const local = email.split('@')[0]?.toLowerCase() ?? '';
    return local === 'new' || local.startsWith('new+') || local.startsWith('new.');
}

function userFromVerify(input: { email: string; lane: AuthLane; name?: string }): AuthUser {
    const isStaff = input.lane === 'STAFF';
    return {
        id: isStaff ? 'e2e-user-1' : 'e2e-client-1',
        email: input.email,
        name: input.name ?? (isStaff ? 'E2E Admin' : 'E2E Member'),
        lane: input.lane,
        roleCode: isStaff ? 'STAFF_UNASSIGNED' : 'CLIENT',
        staffCode: isStaff ? 'STF-E2E' : null,
        emailVerifiedAt: '2026-08-05T00:00:00.000Z',
    };
}

export function createE2eAuthGateway(): AuthGateway {
    return {
        async requestOtp({ email }) {
            return {
                status: 'OTP_SENT',
                isNewUser: isNewUserEmail(email),
            };
        },

        async verifyOtp({ email, lane, name }) {
            const resolvedLane: AuthLane = lane ?? 'STAFF';
            const user = userFromVerify({ email, lane: resolvedLane, name });
            const accessToken = resolvedLane === 'CLIENT' ? E2E_CLIENT_TOKEN : E2E_STAFF_TOKEN_NO_GYM;

            return {
                session: {
                    accessToken,
                    refreshToken: 'e2e-refresh-token',
                    expiresIn: 3600,
                },
                user,
            };
        },

        async completeGoogle({ accessToken, lane, name }) {
            const resolvedLane: AuthLane = lane;
            const email = resolvedLane === 'CLIENT' ? 'e2e-google-client@example.com' : 'e2e-google-staff@example.com';
            const user = userFromVerify({ email, lane: resolvedLane, name });
            // Prefer explicit fixture tokens when tests pass them in the hash.
            if (
                accessToken === E2E_CLIENT_TOKEN ||
                accessToken === E2E_STAFF_TOKEN_NO_GYM ||
                accessToken === E2E_STAFF_TOKEN_WITH_GYM
            ) {
                if (accessToken === E2E_CLIENT_TOKEN) {
                    return {
                        user: userFromVerify({
                            email: 'e2e-client@example.com',
                            lane: 'CLIENT',
                            name,
                        }),
                    };
                }
                if (accessToken === E2E_STAFF_TOKEN_WITH_GYM) {
                    return {
                        user: {
                            ...userFromVerify({
                                email: 'e2e-admin@example.com',
                                lane: 'STAFF',
                                name,
                            }),
                            roleCode: 'ADMIN',
                            staffCode: 'STF-E2E-ADMIN',
                        },
                    };
                }
                return {
                    user: userFromVerify({
                        email: 'e2e-admin@example.com',
                        lane: 'STAFF',
                        name,
                    }),
                };
            }
            return { user };
        },

        async getMe({ accessToken }) {
            if (accessToken === E2E_CLIENT_TOKEN) {
                return {
                    user: userFromVerify({
                        email: 'e2e-client@example.com',
                        lane: 'CLIENT',
                    }),
                };
            }
            if (accessToken === E2E_STAFF_TOKEN_WITH_GYM) {
                return {
                    user: {
                        ...userFromVerify({
                            email: 'e2e-admin@example.com',
                            lane: 'STAFF',
                        }),
                        roleCode: 'ADMIN',
                        staffCode: 'STF-E2E-ADMIN',
                    },
                };
            }
            if (e2eOwnerTokens.has(accessToken)) {
                return {
                    user: {
                        ...userFromVerify({
                            email: 'e2e-admin@example.com',
                            lane: 'STAFF',
                        }),
                        roleCode: 'ADMIN',
                        staffCode: 'STF-E2E',
                    },
                };
            }
            if (e2eAffiliatedTokens.has(accessToken)) {
                return {
                    user: {
                        ...userFromVerify({
                            email: 'e2e-admin@example.com',
                            lane: 'STAFF',
                        }),
                        roleCode: 'TRAINER',
                        staffCode: 'STF-E2E',
                    },
                };
            }
            return {
                user: userFromVerify({
                    email: 'e2e-admin@example.com',
                    lane: 'STAFF',
                }),
            };
        },

        async refreshSession() {
            // Fixture runs are far shorter than the 1h `expiresIn` below, so
            // proxy's refresh path is not expected to fire in E2E — this exists
            // only to satisfy the port contract. It intentionally does not try
            // to round-trip the fixed 'e2e-refresh-token' back to a specific
            // lane's access token (other fakes key off exact token constants).
            return {
                session: {
                    accessToken: E2E_STAFF_TOKEN_NO_GYM,
                    refreshToken: 'e2e-refresh-token',
                    expiresIn: 3600,
                },
            };
        },
    };
}
