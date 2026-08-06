export const THEME_STORAGE_KEY = "gym-saas-theme";

export const themeModes = ["light", "dark"] as const;

export type ThemeMode = (typeof themeModes)[number];

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function resolvePreferredTheme(
  stored: string | null,
  prefersDark: boolean,
): ThemeMode {
  if (isThemeMode(stored)) {
    return stored;
  }
  return prefersDark ? "dark" : "light";
}

/** Inline boot script — set on <html> before paint to avoid flash. */
export const themeBootScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=(s==="light"||s==="dark")?s:(d?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;
