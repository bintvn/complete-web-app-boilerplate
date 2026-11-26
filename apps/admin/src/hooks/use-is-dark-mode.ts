import * as React from "react";
import { useTheme } from "./use-theme";

export function useIsDarkMode() {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateMode = () =>
      setIsDarkMode(
        theme === "dark" || (theme === "system" && mediaQuery.matches),
      );

    updateMode();
    mediaQuery.addEventListener("change", updateMode);

    return () => mediaQuery.removeEventListener("change", updateMode);
  }, [theme]);

  return isDarkMode;
}
