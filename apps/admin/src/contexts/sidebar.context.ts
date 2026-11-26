import { createContext, useContext } from "react";

export interface SidebarConfig {
  variant: "sidebar" | "floating" | "inset";
  collapsible: "offcanvas" | "icon" | "none";
  side: "left" | "right";
}

export interface SidebarContextValue {
  config: SidebarConfig;
  updateConfig: (config: Partial<SidebarConfig>) => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebarConfig() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "useSidebarConfig must be used within a SidebarConfigProvider",
    );
  }
  return context;
}
