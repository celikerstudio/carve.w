export const metadata = {
  title: 'Support - Carve',
  description: 'Answers to common questions about Carve, and a way to reach a real person.',
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout wrapper handles shell and sidebar
  return <>{children}</>;
}
