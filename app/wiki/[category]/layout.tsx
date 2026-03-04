const VALID_CATEGORIES = [
  'nutrition',
  'exercise-science',
  'physiology',
  'training-methods',
  'psychology',
  'injury-health',
];

export default async function WikiCategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  // Only render for valid wiki categories
  const isWikiCategory = VALID_CATEGORIES.includes(category);

  if (!isWikiCategory) {
    return <>{children}</>;
  }

  return (
    <div className="wiki-light min-h-screen bg-surface text-ink">
      {children}
    </div>
  );
}
