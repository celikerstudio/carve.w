import { APP_OMSCHRIJVING, marketingCopy, TALEN, type Taal } from '@/lib/marketing-copy';
import type { VraagPagina } from '@/lib/vraagpaginas';
import { APP_STORE_URL } from '@/lib/utils';

/**
 * De metadata en de structured data van de marketingpagina, per taal.
 *
 * @ai-why: Beide pagina's hebben dezelfde structured data met een andere taal erin.
 * Dat twee keer uitschrijven is de drift die TDR-0012 juist wil voorkomen: één van de
 * twee wordt bijgewerkt en de ander niet, en aan de HTML is dat niet te zien.
 *
 * @ai-sync: app/app/page.tsx (Engels, op `/app`)
 * @ai-sync: app/nl/app/page.tsx (Nederlands, op `/nl/app`)
 * @ai-sync: lib/marketing-copy.ts (waar de teksten vandaan komen)
 * @ai-sync: app/sitemap.ts (dezelfde paden)
 * @ai-sync: docs/tdr/0012-de-marketingpagina-krijgt-een-nederlandse-variant.md
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki';

/** Het pad per taal. `en` blijft op `/app`: TDR-0007 legde dat adres vast. */
export const MARKETING_PADEN: Record<Taal, string> = {
  en: '/app',
  nl: '/nl/app',
};

/**
 * De `hreflang`-verwijzingen: elke taal noemt zichzelf en de ander, plus `x-default`
 * naar het Engels.
 *
 * @ai-gotcha: `x-default` wijst naar `/app` en niet naar de taal van de bezoeker. Er is
 * geen automatische taaldetectie (TDR-0012, beslissing 1), dus er is geen neutrale URL
 * die zelf kiest; het Engels is de standaard.
 */
const TAALALTERNATIEVEN = {
  ...Object.fromEntries(TALEN.map((taal) => [taal, `${SITE_URL}${MARKETING_PADEN[taal]}`])),
  'x-default': `${SITE_URL}${MARKETING_PADEN.en}`,
};

/**
 * @ai-gotcha: Bewust géén `openGraph` hier. Een `openGraph`-blok op paginaniveau
 * VERVANGT dat van de root-layout en neemt daarmee ook de `images` weg die
 * `app/opengraph-image.tsx` injecteert; dat kostte in september 2026 de voorvertoning
 * van precies de URL die gedeeld wordt. De root-layout draagt de belofte al.
 * @ai-todo: De Nederlandse pagina deelt daardoor de Engelse OG-tekst. Dat vraagt een
 * `openGraph` mét expliciete `images`, en dat is los te verifiëren met een fetch op de
 * dev-server. Niet meegenomen in TDR-0012.
 * @ai-sync: app/layout.tsx (title, description, openGraph)
 */
export function marketingMetadata(taal: Taal) {
  const copy = marketingCopy[taal];
  return {
    title: copy.meta.titel,
    description: copy.meta.beschrijving,
    alternates: {
      canonical: `${SITE_URL}${MARKETING_PADEN[taal]}`,
      languages: TAALALTERNATIEVEN,
    },
  };
}

/**
 * @ai-why: Bewust géén `aggregateRating`. Dat veld is de enige reden dat Google er sterren
 * bij zet, en precies daarom is de verleiding groot om er een getal in te zetten dat je
 * niet hebt. Verzonnen recensiecijfers zijn een handmatige strafmaatregel waard en de
 * pagina bewijst zichzelf al met de 50 kilo. Komt er ooit een echt gemiddelde uit App
 * Store Connect, dan mag het erbij, met `ratingCount` uit dezelfde bron.
 *
 * @ai-gotcha: `offers.price` staat op 0 omdat de download gratis is. Dat is niet hetzelfde
 * als "geen abonnement": Pro loopt via in-app aankopen en die horen hier niet als prijs.
 * Zet hier dus geen abonnementsbedrag neer, dan claim je dat de app geld kost om te
 * installeren.
 * @ai-sync: components/carve/CarveMarketingPage.tsx (dezelfde belofte en dezelfde prijsuitleg)
 * @ai-sync: lib/utils.ts (APP_STORE_URL)
 */
export function marketingJsonLd(taal: Taal) {
  const copy = marketingCopy[taal];
  const url = `${SITE_URL}${MARKETING_PADEN[taal]}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'Carve AI',
    alternateName: 'Carve',
    applicationCategory: 'HealthAndFitnessApplication',
    operatingSystem: 'iOS',
    inLanguage: taal,
    url,
    installUrl: APP_STORE_URL,
    sameAs: [APP_STORE_URL],
    image: `${SITE_URL}/opengraph-image`,
    // @ai-why: De vaste omschrijving staat vooraan in `description` én alleen in
    //   `disambiguatingDescription`, het schema.org-veld voor precies dit: de zin die dit
    //   ding van zijn naamgenoten onderscheidt. Gemini kende "Carve AI" alleen als
    //   enterprise-tool en ski-coach (TDR-0014). De pitch komt erachter.
    // @ai-sync: lib/marketing-copy.ts (APP_OMSCHRIJVING)
    description: `${APP_OMSCHRIJVING[taal]} ${copy.meta.beschrijving}`,
    disambiguatingDescription: APP_OMSCHRIJVING[taal],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    author: {
      '@type': 'Organization',
      name: 'Carve AI',
      url: `${SITE_URL}${MARKETING_PADEN.en}`,
      address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressCountry: 'NL' },
    },
  };
}

/**
 * Metadata van een vraagpagina (TDR-0014).
 *
 * @ai-gotcha: Geen `openGraph` hier, om dezelfde reden als bij `marketingMetadata`: een
 * blok op paginaniveau vervangt dat van de root-layout en neemt de `images` mee.
 */
export function vraagMetadata(pagina: VraagPagina) {
  return {
    title: pagina.meta.titel,
    description: pagina.meta.beschrijving,
    alternates: { canonical: `${SITE_URL}${pagina.pad}` },
  };
}

/**
 * De vijf vragen van een vraagpagina als `FAQPage`.
 *
 * @ai-why: De vragen staan ook zichtbaar op de pagina, met exact dezelfde tekst. Google
 * eist dat, en een model dat de HTML leest en een model dat de structured data leest
 * horen hetzelfde antwoord te krijgen.
 * @ai-sync: components/carve/VraagPagina.tsx (rendert dezelfde `faq`)
 */
export function vraagFaqJsonLd(pagina: VraagPagina) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'nl',
    url: `${SITE_URL}${pagina.pad}`,
    mainEntity: pagina.faq.map(({ vraag, antwoord }) => ({
      '@type': 'Question',
      name: vraag,
      acceptedAnswer: { '@type': 'Answer', text: antwoord },
    })),
  };
}
