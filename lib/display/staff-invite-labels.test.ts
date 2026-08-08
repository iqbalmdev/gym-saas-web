import { describe, expect, it } from "vitest";

import { staffInviteErrorMessage } from "@/lib/display/staff-invite-errors";
import {
  formatInviteExpiry,
  staffInviteRoleLabel,
  staffInviteStatusLabel,
} from "@/lib/display/staff-invite-labels";

describe("staff invite display mappers", () => {
  it("maps API codes to calm copy", () => {
    expect(staffInviteErrorMessage("INVALID_STAFF_INVITEE")).toMatch(/staff code/i);
    expect(staffInviteErrorMessage("STAFF_INVITE_ADMIN_CAP")).toMatch(/maximum/i);
  });

  it("labels roles and statuses", () => {
    expect(staffInviteRoleLabel("ADMIN")).toBe("Admin");
    expect(staffInviteStatusLabel("PENDING")).toBe("Pending");
  });

  it("formats expiry for Asia/Kolkata display", () => {
    const label = formatInviteExpiry("2026-08-19T00:00:00.000Z");
    expect(label.length).toBeGreaterThan(4);
  });
});
