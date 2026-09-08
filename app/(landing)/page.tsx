import { CarveMarketingPage } from '@/components/carve/CarveMarketingPage'
import { APP_STORE_URL } from '@/lib/utils'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki'

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
// @ai-sync: next.config.ts (/carve stuurt hierheen door)
export const metadata = {
  title: 'Carve AI — Fitness Coach',
  description: 'Logs your food from a photo. Tracks the muscles you are skipping. Built by someone who lost 50kg using it.',
}

// @ai-why: Er stond geen structured data op de pagina, dus Google wist niet dat carve.wiki
// over een app gaat. Zonder `MobileApplication` blijft de treffer een gewone blauwe link,
// terwijl elke concurrent in dit vak wél een app-resultaat krijgt. Gecontroleerd op
// 2026-09-07: geen `application/ld+json` in de productie-HTML.
//
// @ai-why: Bewust géén `aggregateRating`. Dat veld is de enige reden dat Google er sterren
// bij zet, en precies daarom is de verleiding groot om er een getal in te zetten dat je
// niet hebt. Verzonnen recensiecijfers zijn een handmatige strafmaatregel waard en de
// pagina bewijst zichzelf al met de 50 kilo. Komt er ooit een echt gemiddelde uit App
// Store Connect, dan mag het erbij — met `ratingCount` uit dezelfde bron.
//
// @ai-gotcha: `offers.price` staat op 0 omdat de download gratis is. Dat is niet hetzelfde
// als "geen abonnement": Pro loopt via in-app aankopen en die horen hier niet als prijs.
// Zet hier dus geen abonnementsbedrag neer, dan claim je dat de app geld kost om te
// installeren.
//
// @ai-sync: components/carve/CarveMarketingPage.tsx (dezelfde belofte en dezelfde prijsuitleg)
// @ai-sync: lib/utils.ts (APP_STORE_URL)
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'Carve AI',
  alternateName: 'Carve',
  applicationCategory: 'HealthAndFitnessApplication',
  operatingSystem: 'iOS',
  url: SITE_URL,
  installUrl: APP_STORE_URL,
  sameAs: [APP_STORE_URL],
  image: `${SITE_URL}/opengraph-image`,
  description: metadata.description,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  author: {
    '@type': 'Organization',
    name: 'Carve AI',
    url: SITE_URL,
    address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressCountry: 'NL' },
  },
}

export default function Landing() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <CarveMarketingPage />
    </>
  )
}
