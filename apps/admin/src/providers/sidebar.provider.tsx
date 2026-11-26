import { useCallback, useState } from "react";
import {
  SidebarContext,
  type SidebarConfig,
} from "../contexts/sidebar.context";

export function SidebarConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<SidebarConfig>({
    variant: "inset",
    collapsible: "offcanvas",
    side: "left",
  });

  const updateConfig = useCallback((newConfig: Partial<SidebarConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  return (
    <SidebarContext.Provider value={{ config, updateConfig }}>
      {children}
    </SidebarContext.Provider>
  );
}
