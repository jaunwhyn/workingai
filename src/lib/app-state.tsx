import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { isSupportedLanguage } from "@/lib/languages";

type Theme = "light" | "dark";

interface AppState {
  language: string;
  setLanguage: (language: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

const LANGUAGE_KEY = "wpa.language";
const THEME_KEY = "wpa.theme";

/** Inline script that applies the saved theme before first paint. */
export const themeBootScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}`;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState("English");
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_KEY);
      if (savedLang && isSupportedLanguage(savedLang)) setLanguageState(savedLang);
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === "dark" || savedTheme === "light") setThemeState(savedTheme);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setLanguage = useCallback((next: string) => {
    if (!isSupportedLanguage(next)) return;
    setLanguageState(next);
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AppState>(
    () => ({ language, setLanguage, theme, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark") }),
    [language, setLanguage, theme, setTheme],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
