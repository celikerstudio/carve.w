import { MARKETING_PADEN } from '@/lib/marketing-seo';

/**
 * Naar welke marketingpagina de wortel een bezoeker stuurt, op basis van zijn browsertaal.
 *
 * @ai-why: TDR-0015. Tot 2026-09-27 ging iedereen naar `/app` (Engels), ook met een
 * Nederlandse browser, en op `/app` staat geen zichtbare wissel. TDR-0012 koos daar bewust
 * voor zolang advertentieklikken voorspelbaar moesten landen; die advertenties zijn
 * gestopt.
 *
 * @ai-why: Alleen `nl` en `en`, want alleen die pagina's bestaan. Een taal die de site
 * niet heeft telt niet mee, zodat een Duitser met Nederlands als tweede keus Nederlands
 * krijgt en een Duitser zonder die tweede keus Engels.
 *
 * @ai-gotcha: Geen taalvoorkeur betekent `/app`. Googlebot en de AI-crawlers sturen er
 * meestal geen mee, en `/app` is de `x-default` in de hreflang (TDR-0012).
 *
 * @ai-sync: middleware.ts (de enige aanroeper, alleen op `/`)
 * @ai-sync: lib/marketing-seo.ts (MARKETING_PADEN)
 * @ai-sync: docs/tdr/0015-de-wortel-kiest-de-taal.md
 */
export function marketingPadVoor(acceptLanguage: string | null): string {
  let beste: { taal: 'nl' | 'en'; gewicht: number } | null = null;

  for (const deel of (acceptLanguage ?? '').split(',')) {
    const [label, ...parameters] = deel.trim().toLowerCase().split(';');
    const taal = label.split('-')[0];
    if (taal !== 'nl' && taal !== 'en') continue;

    const q = parameters.map((p) => p.trim()).find((p) => p.startsWith('q='));
    const gewicht = q ? Number(q.slice(2)) : 1;
    if (!(gewicht > 0)) continue;

    // @ai-why: Strikt groter, zodat bij gelijk gewicht de eerste in de lijst wint. Dat is
    //   hoe browsers de volgorde bedoelen.
    if (!beste || gewicht > beste.gewicht) beste = { taal, gewicht };
  }

  return MARKETING_PADEN[beste?.taal ?? 'en'];
}
