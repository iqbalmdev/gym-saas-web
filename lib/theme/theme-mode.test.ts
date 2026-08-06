import { describe, expect, it } from "vitest";

import {
  isThemeMode,
  resolvePreferredTheme,
  THEME_STORAGE_KEY,
} from "@/lib/theme/theme-mode";

describe("isThemeMode", () => {
  it("accepts light and dark only", () => {
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("system")).toBe(false);
    expect(isThemeMode(null)).toBe(false);
    expect(isThemeMode(undefined)).toBe(false);
  });
});

describe("resolvePreferredTheme", () => {
  it("prefers an explicit stored light preference over system dark", () => {
    expect(resolvePreferredTheme("light", true)).toBe("light");
  });

  it("prefers an explicit stored dark preference over system light", () => {
    expect(resolvePreferredTheme("dark", false)).toBe("dark");
  });

  it("falls back to system preference when storage is empty or invalid", () => {
    expect(resolvePreferredTheme(null, true)).toBe("dark");
    expect(resolvePreferredTheme("nope", false)).toBe("light");
  });
});

describe("THEME_STORAGE_KEY", () => {
  it("stays stable for FOUC boot script and ThemeProvider", () => {
    expect(THEME_STORAGE_KEY).toBe("gym-saas-theme");
  });
});
