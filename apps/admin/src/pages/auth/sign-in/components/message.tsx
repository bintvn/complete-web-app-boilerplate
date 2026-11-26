export default function Message({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        tone === "success"
          ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          : "border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
      }
    >
      {children}
    </div>
  );
}
