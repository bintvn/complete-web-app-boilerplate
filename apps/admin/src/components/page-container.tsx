export default function PageContainer({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <div className="px-4 lg:px-6">{children}</div>;
}
