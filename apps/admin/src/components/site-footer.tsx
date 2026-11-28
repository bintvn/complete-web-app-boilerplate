import { cn } from "../lib/utils";

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "bg-background/30 h-(--footer-height) rounded-b-xl border-t flex items-center",
        className,
      )}
    >
      <div className="h-full w-full px-4 lg:px-6 flex items-center justify-center">
        <p className="text-muted-foreground text-center text-xs">
          {import.meta.env.VITE_APP_NAME}. Built for operational clarity.
        </p>
      </div>
    </footer>
  );
}
