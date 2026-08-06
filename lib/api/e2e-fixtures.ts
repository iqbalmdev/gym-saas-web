/**
 * Deterministic Auth + GymOrg adapters for Playwright (`GYM_SAAS_E2E_FIXTURES=1`).
 * Server Actions and RSC call these — browser `page.route` cannot intercept them.
 */
import type { AuthGateway, AuthLane, AuthUser } from "@/lib/ports/auth";
import type { GymOrgsReader, GymOrgsWriter } from "@/lib/ports/gym-orgs";

export const E2E_FIXTURES_ENV = "GYM_SAAS_E2E_FIXTURES";

export const E2E_STAFF_TOKEN_WITH_GYM = "e2e-access-token";
export const E2E_STAFF_TOKEN_NO_GYM = "e2e-access-token-no-gym";
export const E2E_CLIENT_TOKEN = "e2e-client-access";

export function areE2eFixturesEnabled(): boolean {
  return process.env[E2E_FIXTURES_ENV] === "1";
}

function isNewUserEmail(email: string): boolean {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  return local === "new" || local.startsWith("new+") || local.startsWith("new.");
}

function userFromVerify(input: {
  email: string;
  lane: AuthLane;
  name?: string;
}): AuthUser {
  const isStaff = input.lane === "STAFF";
  return {
    id: isStaff ? "e2e-user-1" : "e2e-client-1",
    email: input.email,
    name: input.name ?? (isStaff ? "E2E Admin" : "E2E Member"),
    lane: input.lane,
    roleCode: isStaff ? "STAFF_UNASSIGNED" : "CLIENT",
    staffCode: isStaff ? "STF-E2E" : null,
    emailVerifiedAt: "2026-08-05T00:00:00.000Z",
  };
}

export function createE2eAuthGateway(): AuthGateway {
  return {
    async requestOtp({ email }) {
      return {
        status: "OTP_SENT",
        isNewUser: isNewUserEmail(email),
      };
    },

    async verifyOtp({ email, lane, name }) {
      const resolvedLane: AuthLane = lane ?? "STAFF";
      const user = userFromVerify({ email, lane: resolvedLane, name });
      const accessToken =
        resolvedLane === "CLIENT"
          ? E2E_CLIENT_TOKEN
          : E2E_STAFF_TOKEN_NO_GYM;

      return {
        session: {
          accessToken,
          refreshToken: "e2e-refresh-token",
          expiresIn: 3600,
        },
        user,
      };
    },

    async getMe({ accessToken }) {
      if (accessToken === E2E_CLIENT_TOKEN) {
        return {
          user: userFromVerify({
            email: "e2e-client@example.com",
            lane: "CLIENT",
          }),
        };
      }
      return {
        user: userFromVerify({
          email: "e2e-admin@example.com",
          lane: "STAFF",
        }),
      };
    },
  };
}

export function createE2eGymOrgsAdapter(): GymOrgsReader & GymOrgsWriter {
  return {
    async list({ accessToken }) {
      if (
        accessToken === E2E_STAFF_TOKEN_NO_GYM ||
        accessToken === E2E_CLIENT_TOKEN
      ) {
        return { gymOrgs: [] };
      }
      if (accessToken === E2E_STAFF_TOKEN_WITH_GYM) {
        return {
          gymOrgs: [
            {
              id: "gym-e2e-1",
              name: "E2E Gym",
              timezone: "Asia/Kolkata",
              isOwner: true,
            },
          ],
        };
      }
      return { gymOrgs: [] };
    },

    async create({ body }) {
      return {
        gymOrg: {
          id: "gym-e2e-created",
          name: body.name,
          timezone: body.timezone ?? "Asia/Kolkata",
          isOwner: true,
          createdAt: "2026-08-05T00:00:00.000Z",
        },
      };
    },
  };
}
