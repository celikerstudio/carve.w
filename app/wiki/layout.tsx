import { notFound } from 'next/navigation';
import { SHOW_WIKI } from '@/lib/flags';

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // @ai-why: Eén poort voor de hele wiki: home, [category], [category]/[slug] en de
  // (learn)-groep met de quiz. Een gate per page zou vier plekken zijn, en de volgende
  // categorie die iemand toevoegt komt er ongegate bij.
  // @ai-sync: lib/flags.ts (SHOW_WIKI)
  if (!SHOW_WIKI) notFound();

  return (
    <div className="wiki-light min-h-screen bg-surface text-ink">
      {children}
    </div>
  );
}
