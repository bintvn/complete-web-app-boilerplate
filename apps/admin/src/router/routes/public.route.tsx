/* eslint-disable react-refresh/only-export-components */
import { Navigate, Outlet, type RouteObject, useLocation } from "react-router";
import { lazy } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PublicLayout } from "@/layout";

const SignInPage = lazy(() => import("../../pages/auth/sign-in"));
const SignUpPage = lazy(() => import("../../pages/auth/sign-up"));
const EmailVerificationPage = lazy(
  () => import("../../pages/auth/email-verification"),
);
const ForgotPasswordPage = lazy(
  () => import("../../pages/auth/forgot-password"),
);
const ResetPasswordPage = lazy(() => import("../../pages/auth/reset-password"));

function PublicRoute() {
  const { user } = useAuth();
  const location = useLocation();
  const from = location.state?.from;
  const safeFrom =
    typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("/auth")
      ? from
      : "/";

  if (user) return <Navigate to={safeFrom} replace />;

  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/auth/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/auth/sign-up",
        element: <SignUpPage />,
      },
      {
        path: "/auth/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/auth/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "/auth/email-verification",
        element: <EmailVerificationPage />,
      },
    ],
  },
];
