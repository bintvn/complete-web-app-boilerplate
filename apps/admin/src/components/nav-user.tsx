import {
  CreditCard,
  EllipsisVertical,
  LogOut,
  Settings,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@complete-web-app-boilerplate/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@complete-web-app-boilerplate/ui/components/sidebar";
import { Link } from "react-router";

export type UserMenuItem = {
  url: string;
  label: string;
  icon: LucideIcon;
};

type NavUserProps = {
  name: string;
  email: string;
  onSignOut: () => void | Promise<void>;
  menu?: UserMenuItem[];
};

const defaultMenu: UserMenuItem[] = [
  { url: "/setting/account", label: "Akun", icon: UserCircle },
  { url: "/setting/billing", label: "Billing", icon: CreditCard },
  { url: "/setting", label: "Pengaturan", icon: Settings },
];

export function NavUser({ name, email, onSignOut, menu }: NavUserProps) {
  const { isMobile } = useSidebar();
  const userMenu = menu?.length ? menu : defaultMenu;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[open]:bg-sidebar-accent data-[open]:text-sidebar-accent-foreground cursor-pointer"
              />
            }
          >
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <Logo size={18} />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {email}
              </span>
            </div>
            <EllipsisVertical className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                    <Logo size={18} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {userMenu.map((item) => (
              <DropdownMenuItem
                key={item.url}
                className="cursor-pointer"
                render={<Link to={item.url} />}
              >
                <item.icon />
                {item.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void onSignOut()}
              className="cursor-pointer"
            >
              <LogOut />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
