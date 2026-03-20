export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="wiki-light min-h-screen bg-surface text-ink">
      {children}
    </div>
  );
}
