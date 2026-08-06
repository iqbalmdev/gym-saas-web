"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  THEME_STORAGE_KEY,
  isThemeMode,
  type ThemeMode,
} from "@/lib/theme/theme-mode";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
}

function readDocumentTheme(): ThemeMode {
  if (typeof document === "undefined") {
    return "light";
  }
  const value = document.documentElement.getAttribute("data-theme");
  return isThemeMode(value) ? value : "light";
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Always start light on server + first client paint; sync from DOM/storage after mount.
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    // Boot script already set data-theme; sync React state without fighting it.
    const resolved = readDocumentTheme();
    setThemeState(resolved);
    document.documentElement.dataset.themeReady = "true";
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    applyThemeToDocument(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: ThemeMode = current === "light" ? "dark" : "light";
      applyThemeToDocument(next);
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function onSystemChange(event: MediaQueryListEvent) {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemeMode(stored)) {
        return;
      }
      const next = event.matches ? "dark" : "light";
      setThemeState(next);
      applyThemeToDocument(next);
    }

    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
