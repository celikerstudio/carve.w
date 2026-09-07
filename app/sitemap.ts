import type { MetadataRoute } from 'next'

// @ai-why: Er was geen sitemap en geen robots.txt. TDR-0001 verplaatst de uitleg
// van / naar een aparte pagina, en de aanname "de vindbaarheid verhuist mee" is
// zonder sitemap een aanname zonder mechanisme: / draagt straks vrijwel geen
// tekst meer. Zie docs/tdr/0001-homepage-is-een-keuzescherm.md, consequenties.
//
// @ai-todo: de wiki-artikelen dynamisch meenemen zodra `SHOW_WIKI` weer aanstaat (ze
// staan in Supabase, dus dat vraagt een query hier). /how-it-works is vervallen: TDR-0005 maakt / zelf de marketingpagina.
//
// @ai-gotcha: Een route die achter een uitgezette vlag staat hoort hier niet in — Google
// indexeert dan een 404 en dat kost je de crawl van de pagina's die er wél zijn. Money,
// travel, hiscores en signup zijn er daarom uit sinds 2026-09-05.
// @ai-sync: lib/flags.ts (SHOW_MONEY, SHOW_LIFE, SHOW_WEB_APP, SHOW_WIKI)
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '',                  priority: 1.0,  changeFrequency: 'weekly'  as const },
    { path: '/carve/health',     priority: 0.8,  changeFrequency: 'monthly' as const },
    { path: '/carve/vision',     priority: 0.6,  changeFrequency: 'monthly' as const },
    { path: '/carve/roadmap',    priority: 0.6,  changeFrequency: 'monthly' as const },
    { path: '/carve/faq',        priority: 0.6,  changeFrequency: 'monthly' as const },
    { path: '/login',            priority: 0.3,  changeFrequency: 'yearly'  as const },
    { path: '/privacy',          priority: 0.2,  changeFrequency: 'yearly'  as const },
    { path: '/terms',            priority: 0.2,  changeFrequency: 'yearly'  as const },
  ]

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
