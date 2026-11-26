"use client";

import { useEffect, useState } from "react";
import { ThemeProviderContext, type Theme } from "../contexts/theme.context";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (resolvedTheme: "light" | "dark") => {
      root.classList.toggle("light", resolvedTheme === "light");
      root.classList.toggle("dark", resolvedTheme === "dark");
    };

    if (theme !== "system") {
      applyTheme(theme);
      return;
    }

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = () => applyTheme(systemTheme.matches ? "dark" : "light");

    applySystemTheme();
    systemTheme.addEventListener("change", applySystemTheme);
    return () => systemTheme.removeEventListener("change", applySystemTheme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme);
      setTheme(nextTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
