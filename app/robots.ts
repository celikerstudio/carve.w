import type { MetadataRoute } from 'next'

// @ai-why: carve.wiki gaf tot 2026-09-07 een 404 op /robots.txt. Zonder dat bestand
// wordt de sitemap nergens aangekondigd: Google vindt hem dan alleen als je hem met de
// hand in Search Console indient, en dat was niet gebeurd. Gemeten met
// `curl -s -o /dev/null -w '%{http_code}' https://carve.wiki/robots.txt`.
//
// @ai-why: Alleen `/api/` en de ingelogde routes staan dicht. De rest van de site is
// één marketingpagina plus drie juridische pagina's, dus een fijnmazige lijst zou hier
// alleen maar verouderen. Wat níét geïndexeerd mag worden maar wel publiek is
// (/carve/vision, /carve/roadmap, /carve/faq) draagt zijn eigen `noindex` in
// app/carve/layout.tsx; dat werkt ook als iemand de URL rechtstreeks deelt, en een
// Disallow hier zou juist voorkómen dat Google die noindex ooit leest.
//
// @ai-sync: app/sitemap.ts (dezelfde BASE)
// @ai-sync: app/carve/layout.tsx (noindex op de pagina's die hier bewust niet in Disallow staan)
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', '/settings', '/profile', '/auth/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
