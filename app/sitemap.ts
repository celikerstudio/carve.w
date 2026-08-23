import type { MetadataRoute } from 'next'

// @ai-why: Er was geen sitemap en geen robots.txt. TDR-0001 verplaatst de uitleg
// van / naar een aparte pagina, en de aanname "de vindbaarheid verhuist mee" is
// zonder sitemap een aanname zonder mechanisme: / draagt straks vrijwel geen
// tekst meer. Zie docs/tdr/0001-homepage-is-een-keuzescherm.md, consequenties.
//
// @ai-todo: /how-it-works toevoegen zodra die pagina bestaat, en de wiki-artikelen
// dynamisch meenemen (die staan in Supabase, dus dat vraagt een query hier).
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '',                  priority: 1.0,  changeFrequency: 'weekly'  as const },
    { path: '/carve',            priority: 0.9,  changeFrequency: 'weekly'  as const },
    { path: '/carve/money',      priority: 0.8,  changeFrequency: 'monthly' as const },
    { path: '/carve/travel',     priority: 0.8,  changeFrequency: 'monthly' as const },
    { path: '/carve/health',     priority: 0.8,  changeFrequency: 'monthly' as const },
    { path: '/carve/vision',     priority: 0.6,  changeFrequency: 'monthly' as const },
    { path: '/carve/roadmap',    priority: 0.6,  changeFrequency: 'monthly' as const },
    { path: '/carve/faq',        priority: 0.6,  changeFrequency: 'monthly' as const },
    { path: '/wiki',             priority: 0.9,  changeFrequency: 'weekly'  as const },
    { path: '/hiscores',         priority: 0.5,  changeFrequency: 'daily'   as const },
    { path: '/login',            priority: 0.3,  changeFrequency: 'yearly'  as const },
    { path: '/signup',           priority: 0.5,  changeFrequency: 'yearly'  as const },
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
