import { cn } from "../lib/utils";

export default function PageContent({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("@container/main mt-8", className)}>{children}</div>
  );
}
