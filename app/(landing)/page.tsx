import { CarveMarketingPage } from '@/components/carve/CarveMarketingPage'

// @ai-why: De homepage wás het domein-keuzescherm (TDR-0001). Sinds TDR-0005 is
// carve.wiki een marketingpagina voor de iOS-app en niets anders, dus `/` toont wat
// `/carve` toont. Geen redirect maar dezelfde component: `/` is de URL die mensen
// intikken en waar advertenties en de bio-link naartoe wijzen, en een redirect kost
// daar zowel snelheid als duidelijkheid.
// @ai-gotcha: `LandingPage`, `DomainPicker`, `DomainCardLink` en `lib/domains.ts`
// hebben hiermee geen lezer meer. Bewust niet verwijderd; zie TDR-0005.
//
// @ai-gotcha: Hier stond een eigen `openGraph: { title, description }`. Dat blok
// VERVING het `openGraph` van de root-layout in plaats van het aan te vullen, en daarmee
// ook de `images` die `app/opengraph-image.tsx` daar injecteert. Gevolg: `/carve` en
// `/support` kregen wél een `og:image` en `/` niet — precies de URL die gedeeld wordt.
// Gemeten op 2026-09-05 met een `fetch` op de dev-server; in de code is het niet te zien,
// want een ontbrekende voorvertoning geeft geen fout. Zet hier dus geen `openGraph`-object
// neer zonder `images` mee te nemen; de belofte staat al in de root-layout.
// @ai-sync: app/layout.tsx (title, description, openGraph)
// @ai-sync: app/carve/page.tsx
export const metadata = {
  title: 'Carve AI — Fitness Coach',
  description: 'Logs your food from a photo. Tracks the muscles you are skipping. Built by someone who lost 50kg using it.',
}

export default function Landing() {
  return <CarveMarketingPage />
}
