import type { MetadataRoute } from 'next'
import { VRAAGPAGINAS } from '@/lib/vraagpaginas'
import { listArticles } from '@/lib/wiki/articles'
import { WIKI_CATEGORIES } from '@/lib/wiki/catalog'

// @ai-why: Er was geen sitemap en geen robots.txt. TDR-0001 verplaatst de uitleg
// van / naar een aparte pagina, en de aanname "de vindbaarheid verhuist mee" is
// zonder sitemap een aanname zonder mechanisme: / draagt straks vrijwel geen
// tekst meer. Zie docs/tdr/0001-homepage-is-een-keuzescherm.md, consequenties.
//
// @ai-why: De wiki staat er sinds TDR-0016 weer in: het overzicht, elke categorie en elk
// gepubliceerd artikel, uit dezelfde lijst die de pagina's serveert. `lastModified` van een
// artikel is zijn `updated_at`, zodat Google ziet welk artikel herschreven is.
// @ai-sync: lib/wiki/articles.ts (listArticles)
//
// @ai-gotcha: Een route die achter een uitgezette vlag staat hoort hier niet in. Google
// indexeert dan een 404 en dat kost je de crawl van de pagina's die er wél zijn. Money,
// travel, hiscores en signup zijn er daarom uit sinds 2026-09-05; sinds TDR-0010 bestaan
// die routes helemaal niet meer.
//
// @ai-context: /carve/vision, /carve/roadmap en /carve/faq stonden hier tot 2026-09-07. Die
// pagina's leven nog en geven een 200, maar ze verkopen de brede app van vóór 2026-09-04:
// XP, rangen, geld-tracking. De footer linkt er sinds 2026-09-05 bewust niet meer heen,
// terwijl de sitemap Google er nog actief naartoe stuurde. Dat is dezelfde drift van twee
// kanten. /carve/health stond hier ook nog en is een redirect naar /carve, dus een
// sitemap-URL die nergens heen gaat.
// Sinds 2026-10-16 bestaan ze niet meer en sturen ze door naar /app (next.config.ts).
// @ai-sync: components/carve/CarveFooter.tsx (dezelfde drie links, dezelfde reden)
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    // @ai-gotcha: /app en niet ''. De wortel stuurt sinds TDR-0007 door, en een URL
    // die doorstuurt hoort niet in een sitemap: Google volgt hem wel, maar rapporteert
    // hem als fout en het kost een crawl die je elders nodig hebt.
    { path: '/app',              priority: 1.0,  changeFrequency: 'weekly'  as const },
    // @ai-why: De Nederlandse variant staat er als eigen URL in en niet alleen als
    // `hreflang`-alternatief van /app. Google leest die verwijzingen uit de pagina's zelf,
    // maar een taalvariant die nergens in een sitemap staat wordt trager gevonden.
    // @ai-sync: lib/marketing-seo.ts (MARKETING_PADEN, dezelfde paden)
    // @ai-sync: docs/tdr/0012-de-marketingpagina-krijgt-een-nederlandse-variant.md
    { path: '/nl/app',           priority: 0.9,  changeFrequency: 'weekly'  as const },
    // @ai-why: De drie vraagpagina's van TDR-0014, gelezen uit dezelfde lijst die de
    // route serveert. Een eigen kopie van de paden hier zou precies de drift zijn die de
    // comment bovenaan beschrijft.
    // @ai-sync: lib/vraagpaginas.ts
    ...VRAAGPAGINAS.map((p) => ({ path: p.pad, priority: 0.8, changeFrequency: 'monthly' as const })),
    { path: '/support',          priority: 0.4,  changeFrequency: 'monthly' as const },
    { path: '/login',            priority: 0.3,  changeFrequency: 'yearly'  as const },
    { path: '/privacy',          priority: 0.2,  changeFrequency: 'yearly'  as const },
    { path: '/terms',            priority: 0.2,  changeFrequency: 'yearly'  as const },
    { path: '/wiki',             priority: 0.8,  changeFrequency: 'weekly'  as const },
    ...WIKI_CATEGORIES.map((c) => ({ path: `/wiki/${c.slug}`, priority: 0.6, changeFrequency: 'weekly' as const })),
  ]

  const articles = await listArticles()

  return [
    ...routes.map(({ path, priority, changeFrequency }) => ({
      url: `${BASE}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
    ...articles.map((a) => ({
      url: `${BASE}${a.href}`,
      lastModified: new Date(a.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
