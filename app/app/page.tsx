import { CarveMarketingPage } from '@/components/carve/CarveMarketingPage'
import { marketingCopy } from '@/lib/marketing-copy'
import { marketingJsonLd, marketingMetadata } from '@/lib/marketing-seo'

// @ai-why: Deze pagina stond tot 2026-09-09 op `/` (TDR-0005) en woont sinds TDR-0007
// op `/app`; `/` stuurt er permanent heen. De reden is een adres dat zegt wat het is,
// nu `/chat` de cockpit is en daar een ingang naar deze pagina hoort. De prijs is een
// extra hop voor advertentieverkeer; dat was in TDR-0005 juist het argument om te
// blijven, en het staat als consequentie in TDR-0007.
// @ai-gotcha: `LandingPage`, `DomainPicker`, `DomainCardLink` en `lib/domains.ts`
// hebben hiermee geen lezer meer. Bewust niet verwijderd; zie TDR-0005.
//
// @ai-why: De Engelse pagina blijft op `/app`. TDR-0012 zet de Nederlandse variant
// ernaast op `/nl/app` in plaats van dit adres onder een taalsegment te schuiven: `/app`
// staat in de App Store-listing en in de bio-link, en dat verkeer is internationaal.
//
// @ai-why: De metadata, de `hreflang`-verwijzingen en de structured data komen uit
// `lib/marketing-seo.ts`. Ze stonden hier als letterlijk object, maar sinds er twee
// pagina's zijn zou dat twee keer dezelfde JSON-LD zijn die uit elkaar kan lopen zonder
// dat het aan de HTML te zien is. De gotcha over `openGraph` is met dat object
// meeverhuisd en geldt onverkort.
// @ai-sync: app/nl/app/page.tsx (dezelfde pagina, andere taal)
// @ai-sync: lib/marketing-seo.ts (metadata, hreflang en de structured data)
// @ai-sync: next.config.ts (/ en /carve sturen hierheen door)
// @ai-sync: docs/tdr/0007-de-marketingpagina-verhuist-naar-app.md
// @ai-sync: docs/tdr/0012-de-marketingpagina-krijgt-een-nederlandse-variant.md
export const metadata = marketingMetadata('en')

const JSON_LD = marketingJsonLd('en')

export default function AppPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <CarveMarketingPage copy={marketingCopy.en} taal="en" />
    </>
  )
}
