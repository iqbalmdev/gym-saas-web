import { describe, expect, it } from "vitest";

import {
  adminNavItems,
  resolveAdminHomeHref,
} from "@/lib/features/admin/admin-nav";

describe("adminNavItems", () => {
  it("exposes only Settings in settings-only mode", () => {
    expect(adminNavItems("settings-only")).toEqual([
      { href: "/admin/settings", label: "Settings", icon: "settings" },
    ]);
  });

  it("exposes full Admin modules in full mode", () => {
    const items = adminNavItems("full");
    expect(items.map((item) => item.label)).toEqual([
      "Dashboard",
      "Renewals",
      "Leads",
      "Members",
      "Attendance",
      "Plans",
      "Settings",
    ]);
  });
});

describe("resolveAdminHomeHref", () => {
  it("points brand home at Settings when settings-only", () => {
    expect(resolveAdminHomeHref("settings-only")).toBe("/admin/settings");
  });

  it("points brand home at Dashboard when full", () => {
    expect(resolveAdminHomeHref("full")).toBe("/admin");
  });
});
