import { CarveMarketingPage } from '@/components/carve/CarveMarketingPage'
import { marketingCopy } from '@/lib/marketing-copy'
import { marketingJsonLd, marketingMetadata } from '@/lib/marketing-seo'

// @ai-why: De Nederlandse marketingpagina (TDR-0012). De Google Ads-campagnes staan op
// Nederland en de zoektermen die binnenkomen zijn voor een groot deel Nederlands, terwijl
// de advertenties op een Engelse pagina uitkwamen. De kwaliteitsscore rekent de
// landingspagina mee, dus de taal van de pagina is hier geen cosmetiek.
//
// @ai-why: Geen automatische taaldetectie op `/app`. Wie hier hoort te landen wordt door
// de advertentie hierheen gestuurd. Een redirect op `Accept-Language` maakt de bestemming
// van een betaalde klik afhankelijk van een browserinstelling en laat Googlebot iets
// anders zien dan een bezoeker.
//
// @ai-gotcha: Dezelfde component, dezelfde opmaak, alleen een ander copy-object. Pas je
// hier iets aan de structuur aan, dan verandert `/app` mee. Dat is de bedoeling; de tekst
// hoort in `lib/marketing-copy.ts` en nergens anders.
//
// @ai-gotcha: De uiteindelijke URL van de Google Ads-campagnes moet op `/nl/app` staan.
// Blijft die op `/app`, dan landt Nederlandstalig advertentieverkeer nog steeds op de
// Engelse pagina en heeft deze pagina geen effect. Dat is buiten deze repo, en staat als
// consequentie in de TDR.
// @ai-sync: app/app/page.tsx (dezelfde pagina, Engels)
// @ai-sync: lib/marketing-copy.ts (de Nederlandse teksten)
// @ai-sync: lib/marketing-seo.ts (metadata, hreflang en de structured data)
// @ai-sync: app/sitemap.ts (dit pad staat daar ook)
// @ai-sync: docs/tdr/0012-de-marketingpagina-krijgt-een-nederlandse-variant.md
export const metadata = marketingMetadata('nl')

const JSON_LD = marketingJsonLd('nl')

export default function NederlandseAppPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <CarveMarketingPage copy={marketingCopy.nl} taal="nl" />
    </>
  )
}
