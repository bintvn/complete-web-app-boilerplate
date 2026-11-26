import { cn } from "../../lib/utils";
import "./styles.css";
import { type ReactNode } from "react";

export function MainContent({ children }: { children: ReactNode }) {
  return (
    <div
      className="custom-content-scroll flex min-h-0 flex-1 flex-col overflow-auto"
      style={{
        paddingTop: "var(--header-height)",
        paddingBottom:
          "calc(var(--footer-height) + env(safe-area-inset-bottom))",
        scrollPaddingBottom: "calc(var(--footer-height) + 1rem)",
      }}
    >
      <div className="@container/main flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {children}
          {/* <div
                    aria-hidden="true"
                    style={{ height: 'calc(var(--footer-height) + env(safe-area-inset-bottom) - 16px)' }}
                /> */}
          <div
            aria-hidden="true"
            className={cn(
              "h-[calc(var(--footer-height)+env(safe-area-inset-bottom)-16px)]",
              "md:h-[calc(var(--footer-height)+env(safe-area-inset-bottom)-26px)]",
            )}
          />
        </div>
      </div>
    </div>
  );
}
