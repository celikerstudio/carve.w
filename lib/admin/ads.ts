/**
 * Wat elke campagne kostte en wat eruit kwam, in één tabel.
 *
 * @ai-why: Meta kent de kosten per campagne en GA4 kent het resultaat, en ze worden
 * gekoppeld op campagne-ID (`utm_id`) en niet op naam. Een naam is muteerbaar en gaat
 * rauw de advertentie-URL in; hernoemen zou de historie splitsen en een `&` in een naam
 * breekt de link. Zie docs/tdr/0009-campagnerendement-komt-uit-ga4.md, beslissing 4.
 *
 * @ai-gotcha: Downloads en accounts staan hier bewust niet per campagne. Apple's
 * verkooprapport en onze eigen database kennen geen herkomst, en ze naar rato van de
 * klikken verdelen zou een aanname opleveren die eruitziet als een meting. Dat cijfer
 * blijft accountbreed op het Overzicht staan.
 *
 * @ai-sync: docs/tdr/0009-campagnerendement-komt-uit-ga4.md
 * @ai-sync: lib/admin/sources/meta.ts
 * @ai-sync: lib/admin/sources/ga4.ts
 */

/** Eén campagne zoals Meta hem rapporteert, plus of zijn advertenties getagd zijn. */
export interface MetaCampaign {
  id: string
  name: string
  spend: number
  clicks: number
  impressions: number
  /** Staat `utm_id` in de `url_tags` van minstens één advertentie in deze campagne. */
  tagged: boolean
}

/** Eén rij uit GA4, gegroepeerd op `sessionCampaignId`. */
export interface Ga4Campaign {
  campaignId: string
  visitors: number
  appStoreClicks: number
}

/**
 * Waarom er wel of geen resultaatcijfers staan.
 *
 * @ai-why: Drie waarden en geen boolean, omdat "we weten het niet" op twee manieren
 * ontstaat en die twee verschillende acties vragen. `geen-utm` repareer je in Ads
 * Manager; `geen-gegevens` betekent dat de tag er staat maar GA4 niets teruggaf, en dan
 * is er niets te repareren. Zonder dit onderscheid staat er in beide gevallen een
 * streepje en ga je in de verkeerde hoek zoeken.
 */
export type Attribution = 'gemeten' | 'geen-utm' | 'geen-gegevens'

export interface AdCampaignRow {
  id: string
  name: string
  spend: number
  clicks: number
  impressions: number
  /** Doorklikratio in procenten, op één decimaal. */
  ctr: number | null
  cpc: number | null
  /** Kosten per duizend vertoningen. */
  cpm: number | null
  visitors: number | null
  appStoreClicks: number | null
  costPerAppStoreClick: number | null
  attribution: Attribution
}

export interface AdsTotals {
  spend: number
  clicks: number
  impressions: number
  ctr: number | null
  cpc: number | null
  /** De uitgaven van de campagnes waar GA4 wél cijfers over gaf. */
  measuredSpend: number
  measuredAppStoreClicks: number
  costPerAppStoreClick: number | null
  /** Uitgaven aan campagnes zonder `utm_id`, dus buiten elke meting. */
  untaggedSpend: number
}

export interface Ads {
  rows: AdCampaignRow[]
  totals: AdsTotals
}

/**
 * @ai-why: Delen door nul geeft `null` en niet 0 of Infinity, net als in
 * lib/admin/funnel.ts. Nul vertoningen betekent "niet te zeggen", niet "0% klikt door".
 */
function deel(teller: number, noemer: number, decimalen: number): number | null {
  if (noemer === 0) return null
  const factor = 10 ** decimalen
  return Math.round((teller / noemer) * factor) / factor
}

export function buildAds(campaigns: MetaCampaign[], ga4Rows: Ga4Campaign[]): Ads {
  const perId = new Map(ga4Rows.map((r) => [r.campaignId, r]))

  const rows: AdCampaignRow[] = campaigns
    .map((campagne) => {
      const ga4 = campagne.tagged ? perId.get(campagne.id) : undefined
      const attribution: Attribution = !campagne.tagged
        ? 'geen-utm'
        : ga4
          ? 'gemeten'
          : 'geen-gegevens'

      return {
        id: campagne.id,
        name: campagne.name,
        spend: campagne.spend,
        clicks: campagne.clicks,
        impressions: campagne.impressions,
        ctr: deel(campagne.clicks * 100, campagne.impressions, 1),
        cpc: deel(campagne.spend, campagne.clicks, 2),
        cpm: deel(campagne.spend * 1000, campagne.impressions, 2),
        visitors: ga4?.visitors ?? null,
        appStoreClicks: ga4?.appStoreClicks ?? null,
        costPerAppStoreClick: ga4 ? deel(campagne.spend, ga4.appStoreClicks, 2) : null,
        attribution,
      }
    })
    .sort((a, b) => b.spend - a.spend)

  const som = (pick: (r: AdCampaignRow) => number) => rows.reduce((t, r) => t + pick(r), 0)
  const gemeten = rows.filter((r) => r.attribution === 'gemeten')

  // @ai-why: De noemer telt alleen de gemeten campagnes, en de teller dus ook. Zou je de
  // volledige uitgaven delen door de klikken die je toevallig kunt zien, dan lijkt elke
  // ongetagde campagne het cijfer van de rest te verpesten en stuur je op ruis.
  const measuredSpend = gemeten.reduce((t, r) => t + r.spend, 0)
  const measuredAppStoreClicks = gemeten.reduce((t, r) => t + (r.appStoreClicks ?? 0), 0)

  const spend = som((r) => r.spend)
  const clicks = som((r) => r.clicks)
  const impressions = som((r) => r.impressions)

  return {
    rows,
    totals: {
      spend,
      clicks,
      impressions,
      ctr: deel(clicks * 100, impressions, 1),
      cpc: deel(spend, clicks, 2),
      measuredSpend,
      measuredAppStoreClicks,
      costPerAppStoreClick: deel(measuredSpend, measuredAppStoreClicks, 2),
      untaggedSpend: rows
        .filter((r) => r.attribution === 'geen-utm')
        .reduce((t, r) => t + r.spend, 0),
    },
  }
}
