/* eslint-disable react-refresh/only-export-components */
import { BaseLayout } from "@/layout";
import { type RouteObject, Navigate, Outlet, useLocation } from "react-router";
import { lazy } from "react";
import { sidebarMenu, userMenu } from "../../sidebarMenu";
import { useAuth } from "@/hooks/use-auth";

const DashboardPage = lazy(() => import("@/pages/dashboard/index"));
const StreamPage = lazy(() => import("@/pages/stream/index"));
const AccountPage = lazy(() => import("@/pages/setting/account"));
const SettingPage = lazy(() => import("@/pages/setting/index"));

function ProtectedRoute() {
  const { signOut, user } = useAuth();
  const { pathname } = useLocation();

  if (!user)
    return (
      <Navigate
        to="/auth/sign-in"
        replace
        state={{ from: `${pathname}${location.search}${location.hash}` }}
      />
    );

  return (
    <BaseLayout
      sidebarBrand={{
        title: import.meta.env.VITE_APP_NAME,
        subtitle: "Dashboard",
      }}
      user={user}
      onSearch={async () => {
        throw new Error("Pencarian belum tersedia.");
      }}
      onSignOut={signOut}
      sidebarMenu={sidebarMenu}
      userMenu={userMenu}
    >
      <Outlet />
    </BaseLayout>
  );
}

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/stream",
        element: <StreamPage />,
      },
      {
        path: "/setting/account",
        element: <AccountPage />,
      },
      {
        path: "/setting",
        element: <SettingPage />,
      },
    ],
  },
];
