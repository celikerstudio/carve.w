import Link from "next/link";

/**
 * @ai-why: Deze pagina draagt zijn eigen achtergrond en staat niet in een shell. Tot
 * 2026-09-10 erfde hij zijn donkere vlak van de zijbalk-tak in de layout-wrapper; die is
 * met TDR-0010 weg, en zonder deze `bg` zou een 404 wit worden op een verder zwarte site.
 *
 * @ai-why: `#0A0A0B` en niet `bg-surface`, omdat de enige knop hier naar /app gaat en dat
 * de kleur is waar je dan aankomt.
 *
 * @ai-gotcha: Een 404 op een pad onder /wiki of op een marketingpagina komt hier ook
 * terecht, maar mét de AppHeader eromheen: die takken in de layout-wrapper matchen op het
 * pad en niet op het bestaan van de pagina. Dezelfde tekst, twee omlijstingen.
 *
 * @ai-sync: components/app/layout-wrapper.tsx (de tak die hier geen chrome omheen zet)
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl font-bold text-white mb-4">404</h1>
      <p className="text-white/50 mb-8 text-center">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/app"
        className="px-6 py-3 bg-white/[0.08] border border-white/[0.08] text-white rounded-xl hover:bg-white/[0.12] transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
