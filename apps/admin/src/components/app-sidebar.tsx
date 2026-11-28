import { NavMain, type SharedNavItem } from "./nav-main";
import { NavUser, type UserMenuItem } from "./nav-user";
import { Badge } from "@complete-web-app-boilerplate/ui/components/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@complete-web-app-boilerplate/ui/components/sidebar";

import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import type { UserDTO } from "@/types/dtos";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  hasActiveSubscription?: boolean;
  menu: NavGroup[];
  pathname: string;
  user: UserDTO;
  onSignOut: () => void | Promise<void>;
  userMenu?: UserMenuItem[];
  renderBrandLink: () => ReactNode;
};

export type NavGroup = {
  label: string;
  items: SharedNavItem[];
};

export function AppSidebar({
  menu,
  pathname,
  user,
  onSignOut,
  userMenu,
  renderBrandLink,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">{renderBrandLink()}</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menu.map((group, index) => (
          <NavMain
            key={index}
            label={group.label}
            items={group.items}
            pathname={pathname}
          />
        ))}
      </SidebarContent>
      <div className="px-4 py-2">
        <span className="text-sm font-light mr-2">Paket Langganan</span>
        <Badge variant="default" className={cn("bg-blue-800")}>
          Plan Name
        </Badge>
      </div>
      <SidebarFooter>
        <NavUser
          name={user.name}
          email={user.email}
          onSignOut={onSignOut}
          menu={userMenu}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
