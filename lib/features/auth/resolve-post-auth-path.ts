import type { AuthLane } from "@/lib/ports/auth";

export type PostAuthRouteInput = {
  lane: AuthLane;
  gymOrgCount: number;
};

/**
 * Pure post-login destination — Staff without a GymOrg must create one first.
 */
export function resolvePostAuthPath(input: PostAuthRouteInput): string {
  if (input.lane === "CLIENT") {
    return "/client";
  }
  if (input.gymOrgCount === 0) {
    return "/onboarding/create-gym";
  }
  return "/admin";
}
