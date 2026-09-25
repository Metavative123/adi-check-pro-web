"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "adi_theme";

// The saved preference and the OS setting are both external stores, read with
// useSyncExternalStore. That gives correct hydration without setting state in
// an effect, which would cost an extra render on every page load.

// --- the saved preference ---
const listeners = new Set<() => void>();
let cached: Theme | null = null;

function readStored(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // Private browsing or blocked storage - fall back to following the OS.
  }
  return "system";
}

function subscribePreference(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function preferenceSnapshot(): Theme {
  if (cached === null) cached = readStored();
  return cached;
}

// There is no preference on the server; the inline script has already applied
// the real one to the document before React runs.
function preferenceServerSnapshot(): Theme {
  return "system";
}

function writePreference(next: Theme) {
  cached = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Not being able to remember the choice should not break the switch.
  }
  listeners.forEach((listener) => listener());
}

// --- what the operating system is set to ---
function subscribeSystem(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function systemSnapshot(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function systemServerSnapshot(): ResolvedTheme {
  return "light";
}

type ThemeContextValue = {
  theme: Theme;
  // What "system" actually resolved to, so components can branch on it.
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribePreference,
    preferenceSnapshot,
    preferenceServerSnapshot
  );
  const system = useSyncExternalStore(
    subscribeSystem,
    systemSnapshot,
    systemServerSnapshot
  );

  const resolvedTheme: ResolvedTheme = theme === "system" ? system : theme;

  // Only touches the DOM - no state is set, so this costs no extra render.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme: writePreference }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}

// Runs before React, before the first paint, so the page never flashes the
// wrong theme. Kept as a string because it has to be inlined into the HTML.
export const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("${STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark" ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;
