import type { MetadataRoute } from 'next'

// @ai-why: carve.wiki gaf tot 2026-09-07 een 404 op /robots.txt. Zonder dat bestand
// wordt de sitemap nergens aangekondigd: Google vindt hem dan alleen als je hem met de
// hand in Search Console indient, en dat was niet gebeurd. Gemeten met
// `curl -s -o /dev/null -w '%{http_code}' https://carve.wiki/robots.txt`.
//
// @ai-why: Alleen `/api/` en het beheer staan dicht. De rest van de site is één
// marketingpagina plus drie juridische pagina's, dus een fijnmazige lijst zou hier alleen
// maar verouderen. De oude /carve-pagina's die hier met een eigen `noindex` stonden zijn
// op 2026-10-16 verwijderd; ze sturen nu permanent door naar /app (next.config.ts).
//
// @ai-sync: app/sitemap.ts (dezelfde BASE)
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // @ai-why: De cockpit staat op de wortel en stuurt bezoekers zonder sessie naar
      // /app, dus een crawler komt er nooit binnen. `/beheer` staat er wel expliciet in:
      // die route bestaat en geeft een redirect, en dat kost een crawl voor niets.
      // @ai-sync: app/(cockpit)/beheer/layout.tsx
      disallow: ['/api/', '/beheer', '/auth/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
