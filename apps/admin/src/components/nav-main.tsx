import { ChevronRight, type LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@complete-web-app-boilerplate/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@complete-web-app-boilerplate/ui/components/sidebar";
import { Link } from "react-router";

export type SharedNavItem = {
  title: string;
  url: string;
  expand?: boolean;
  icon: LucideIcon;
  disabled?: boolean;
  items?: Array<{ title: string; url: string; disabled?: boolean }>;
};

type NavMainProps = {
  label: string;
  items: SharedNavItem[];
  pathname: string;
};

function isPathMatch(targetUrl: string, pathname: string) {
  return pathname === targetUrl || pathname.startsWith(`${targetUrl}/`);
}

export function NavMain({ label, items, pathname }: NavMainProps) {
  const { openMobile, setOpenMobile } = useSidebar();
  const [manualOpenMap, setManualOpenMap] = useState<Record<string, boolean>>(
    {},
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="pl-2 select-none">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const itemKey = `${label}:${item.url}:${item.title}`;
          const isRouteMatch =
            item.items?.some((subItem) => isPathMatch(subItem.url, pathname)) ??
            false;
          const isForcedExpand = item.expand === true;
          const isOpen =
            manualOpenMap[itemKey] ?? (isForcedExpand || isRouteMatch);

          if (item.items?.length) {
            return (
              <Collapsible
                key={itemKey}
                className="group/collapsible"
                open={isOpen}
                onOpenChange={(open) => {
                  setManualOpenMap((prev) => ({
                    ...prev,
                    [itemKey]: open,
                  }));
                }}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="cursor-pointer"
                      />
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            aria-disabled={subItem.disabled}
                            isActive={isPathMatch(subItem.url, pathname)}
                            onClick={() =>
                              !subItem.disabled &&
                              openMobile &&
                              setOpenMobile(false)
                            }
                            render={
                              subItem.disabled ? (
                                <span />
                              ) : (
                                <Link to={subItem.url} />
                              )
                            }
                          >
                            {subItem.title}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={itemKey}>
              <SidebarMenuButton
                tooltip={item.title}
                aria-disabled={item.disabled}
                isActive={pathname === item.url}
                onClick={() =>
                  !item.disabled && openMobile && setOpenMobile(false)
                }
                render={item.disabled ? <span /> : <Link to={item.url} />}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
