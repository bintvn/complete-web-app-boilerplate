/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter, isRouteErrorResponse, Outlet, useRouteError } from "react-router";
import { publicRoutes } from "./routes/public.route";
import { protectedRoutes } from "./routes/protected.route";
import { FullscreenLoader } from "@/components/fullscreen-loader";

const NotFoundPage = lazy(() => import("../pages/not-found"));

function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) if (error.status === 404) return <NotFoundPage />;

  if (error instanceof Error) if (error.message === "PAGE_NOT_FOUND") return <NotFoundPage />;

  return <div>Something went wrong!</div>;
}

export const router = createBrowserRouter([
  {
    element: (
      <Suspense fallback={<FullscreenLoader message="Loading..." />}>
        <Outlet />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      ...publicRoutes,
      ...protectedRoutes,
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
