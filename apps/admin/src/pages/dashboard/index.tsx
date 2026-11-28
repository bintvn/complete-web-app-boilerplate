import { lazy } from "react";

const QuickActions = lazy(() => import("./components/quick-actions"));

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Business Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your business performance and key metrics in real-time
          </p>
        </div>
        <QuickActions />
      </div>

      <div className="@container/main space-y-6">Main Contents</div>
    </div>
  );
}
