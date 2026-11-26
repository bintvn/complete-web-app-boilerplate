import * as React from "react";
import BokehBackground from "./bokeh-background";

type BackgroundShellProps = {
  children: React.ReactNode;
  contentClassName?: string;
};

export function BackgroundShell({
  children,
  contentClassName,
}: BackgroundShellProps) {
  return (
    <div className="relative min-h-svh">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0">
          <BokehBackground />
        </div>
        <div className="absolute inset-0 bg-transparent dark:bg-transparent" />
      </div>
      <div className={contentClassName ?? "relative z-10"}>{children}</div>
    </div>
  );
}
