import type { Metadata } from 'next';

/**
 * @ai-why: `noindex` op alles onder /carve. De pagina's hieronder (vision, roadmap,
 * faq, contributing, developer, updates) leven nog en geven een 200, maar ze beschrijven
 * de brede app van vóór 2026-09-04: XP, rangen, geld-tracking, een web-platform. TDR-0005
 * haalde ze uit de footer en op 2026-09-07 uit de sitemap; zonder deze regel bleef Google
 * ze indexeren via de links die er van buitenaf naartoe wijzen, en dan verkoopt de
 * eerste treffer op "carve fitness" nog steeds het oude product.
 *
 * De URL's blijven bewust bestaan (oude links en gedeelde screenshots moeten blijven
 * werken); ze horen alleen niet meer in een zoekresultaat. Herschrijf je er één zodat
 * hij weer klopt met de app van vandaag, zet hem dan hier expliciet weer op index met
 * een eigen `metadata` in die route.
 *
 * @ai-gotcha: /carve zelf komt hier nooit langs: next.config.ts stuurt die permanent
 * door naar /. Deze layout raakt dus alleen de subpagina's.
 *
 * @ai-sync: app/sitemap.ts (dezelfde pagina's staan er daar niet meer in)
 * @ai-sync: components/carve/CarveFooter.tsx (dezelfde drie links, dezelfde reden)
 * @ai-sync: docs/tdr/0005-carve-wiki-is-een-marketingpagina.md (beslissing 5: wat publiek blijft)
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function CarveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout wrapper handles shell and sidebar
  return <>{children}</>;
}
