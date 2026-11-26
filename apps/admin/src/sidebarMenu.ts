import { LayoutDashboardIcon, UsersIcon, StickyNoteIcon, CircleChevronDownIcon } from "lucide-react";
import type { NavGroup } from "./components/app-sidebar";
import type { UserMenuItem } from "./components/nav-user";

export const sidebarMenu: NavGroup[] = [
  {
    label: "Main Menu",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Page 1",
        url: "/page1",
        icon: StickyNoteIcon,
      },
      {
        title: "Page 2",
        url: "/page2",
        icon: StickyNoteIcon,
      },
      {
        title: "Sub Menu",
        url: "/submenu",
        icon: CircleChevronDownIcon,
        items: [
          { title: "Sub 1", url: "/submenu/sub1" },
          { title: "Sub 2", url: "/submenu/sub2" },
          { title: "Sub 3", url: "/submenu/sub3" },
        ],
      },
    ],
  },
  {
    label: "Other",
    items: [
      { title: "Page 3", url: "/page3", icon: StickyNoteIcon },
      { title: "Page 4", url: "/page4", icon: StickyNoteIcon },
    ],
  },
];

export const userMenu: UserMenuItem[] = [
  { url: "/setting/account", label: "Akun", icon: UsersIcon },
  // { url: '/setting', label: 'Pengaturan', icon: UsersIcon }
];
