"use server";

import { revalidatePath } from "next/cache";

import { createAppServices } from "@/lib/api/composition";
import { ApiClientError } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";
import { attendanceErrorMessage } from "@/lib/display/attendance-errors";

export type AttendanceActionResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

function fail(error: unknown): AttendanceActionResult {
  if (error instanceof ApiClientError) {
    return {
      ok: false,
      code: error.code,
      message: attendanceErrorMessage(error.code, error.message),
    };
  }
  if (error instanceof Error && error.name === "ZodError") {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: attendanceErrorMessage("VALIDATION_ERROR"),
    };
  }
  return {
    ok: false,
    code: "NETWORK_OR_UNKNOWN",
    message: attendanceErrorMessage("NETWORK_OR_UNKNOWN"),
  };
}

/** Auth + STAFF + gym tenant. API enforces ADMIN. No DataGrant (gym-owned). */
async function requireStaffAdminGym(): Promise<
  | { ok: true; accessToken: string; gymOrgId: string }
  | { ok: false; result: AttendanceActionResult }
> {
  const session = await getSession();
  if (!session || session.lane !== "STAFF") {
    return {
      ok: false,
      result: {
        ok: false,
        code: "AUTHENTICATION_FAILED",
        message: attendanceErrorMessage("AUTHENTICATION_FAILED"),
      },
    };
  }
  const { listGymOrgs } = createAppServices();
  const { gymOrgs } = await listGymOrgs({ accessToken: session.accessToken });
  const gymOrgId = gymOrgs[0]?.id;
  if (!gymOrgId) {
    return {
      ok: false,
      result: {
        ok: false,
        code: "FORBIDDEN",
        message: attendanceErrorMessage("FORBIDDEN"),
      },
    };
  }
  return { ok: true, accessToken: session.accessToken, gymOrgId };
}

export async function deskMarkAttendanceAction(input: {
  clientUserId: string;
}): Promise<AttendanceActionResult> {
  const gate = await requireStaffAdminGym();
  if (!gate.ok) {
    return gate.result;
  }
  const clientUserId = input.clientUserId.trim();
  if (!clientUserId) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: attendanceErrorMessage("VALIDATION_ERROR"),
    };
  }
  try {
    const { deskMarkAttendance } = createAppServices();
    await deskMarkAttendance({
      accessToken: gate.accessToken,
      gymOrgId: gate.gymOrgId,
      clientUserId,
    });
    revalidatePath("/admin/attendance");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
