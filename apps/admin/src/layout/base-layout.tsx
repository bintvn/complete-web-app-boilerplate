import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "../lib/utils";
import type { UserMenuItem } from "../components/nav-user";
import { useSidebarConfig } from "@/contexts/sidebar.context";
import type { SearchDTO } from "@/types/common";
import type { UserDTO } from "@/types/dtos";
import type { ApiSuccess } from "@/types/api";
import { useIsMobile } from "@complete-web-app-boilerplate/ui/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";
import { useIsDarkMode } from "@/hooks/use-is-dark-mode";
import {
  SidebarInset,
  SidebarProvider,
} from "@complete-web-app-boilerplate/ui/components/sidebar";
import { Logo } from "@/components/logo";
import { type NavGroup, AppSidebar } from "@/components/app-sidebar";
import { MainContent } from "@/components/main-content";
import { ModeToggle } from "@/components/mode-toggle";
import { SearchSiteHeader } from "@/components/search-site-header";
import { SiteFooter } from "@/components/site-footer";

export function BaseLayout({
  children,
  onSearch,
  onSignOut,
  user,
  sidebarBrand,
  sidebarMenu,
  userMenu,
}: {
  onSearch: (query: string) => Promise<ApiSuccess<SearchDTO[]>>;
  onSignOut: () => Promise<{ success: boolean }>;
  user: UserDTO;
  sidebarBrand: {
    title: string;
    subtitle?: string;
  };
  children: React.ReactNode;
  sidebarMenu: NavGroup[];
  userMenu: UserMenuItem[];
  propertySelector?: () => React.ReactNode;
}) {
  const { config } = useSidebarConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const isDarkMode = useIsDarkMode();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "calc(var(--spacing) * 14)",
          "--footer-height": "calc(var(--spacing) * 18)",
        } as React.CSSProperties
      }
      className={cn(config.collapsible === "none" ? "sidebar-none-mode" : "")}
    >
      <AppSidebar
        menu={sidebarMenu ?? []}
        variant={config.variant}
        collapsible={config.collapsible}
        side={config.side}
        pathname={location.pathname}
        user={user}
        onSignOut={async () => {
          await onSignOut();
          navigate("/auth/sign-in", { replace: true });
        }}
        renderBrandLink={() => (
          <Link to="/">
            <div className="flex flex-row gap-2">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Logo size={20} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {sidebarBrand.title}
                </span>
                {sidebarBrand.subtitle && (
                  <span className="truncate text-xs">
                    {sidebarBrand.subtitle}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )}
        userMenu={userMenu}
      />
      <SidebarInset
        className={cn(
          isDarkMode ? "bg-black/30" : "bg-transparent",
          "relative overflow-hidden flex min-h-0 flex-col",
        )}
      >
        <SearchSiteHeader
          className={cn(
            "absolute top-0 right-0 left-0 z-20 border-b",
            "bg-background/40 backdrop-blur-md supports-backdrop-filter:bg-background/30",
          )}
          isMobile={isMobile}
          onSearch={async (query) => {
            if (!query.trim()) return [];
            const res = await onSearch(query);

            return res.data;
          }}
          onSelectResult={(item) => navigate(item.path)}
          rightActions={
            <ModeToggle
              isDarkMode={isDarkMode}
              onToggle={() => setTheme(isDarkMode ? "light" : "dark")}
              theme={theme}
            />
          }
        />
        <MainContent>{children}</MainContent>
        <SiteFooter
          className={cn(
            "absolute right-0 bottom-0 left-0 z-20 border-t rounded-b-none h-14 md:h-(--footer-height)",
            "bg-background/40 backdrop-blur-md supports-backdrop-filter:bg-background/30",
          )}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
