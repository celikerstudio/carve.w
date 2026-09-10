/**
 * Laag D: wat zou je moeten doen. Voorstellen, nooit uitvoeren.
 *
 * @ai-why: Deze module raakt geen netwerk. Hij is puur, en dat is opzet: de enige manier
 * waarop een advertentieaccount hiervandaan geld kan uitgeven, is doordat een mens een
 * voorstel leest en het zelf doorvoert. Een agent met schrijfrechten op een advertentie-
 * account kan in stilte budget verbranden, en het foutgeval is dan niet "een verkeerd
 * getal op een scherm" maar "een week uitgaven weg". De prijs van deze keuze is dat je
 * zelf naar Ads Manager moet; dat is een lage prijs.
 *
 * @ai-why: De harde regel hieronder is dat er geen enkel voorstel komt zolang de
 * tracking-check `fout` staat. Dit is de belangrijkste eigenschap van deze laag. Als de
 * meting kapot is, zijn de cijfers waarop een voorstel rust onbetrouwbaar, en een
 * zelfverzekerd voorstel op kapotte data is precies de manier waarop dit soort systemen
 * schade doet: het pauzeert de campagne die wél werkte maar niet gemeten werd. Eerst
 * repareren, dan pas oordelen.
 *
 * @ai-sync: lib/admin/observe.ts
 * @ai-sync: lib/admin/tracking-check.ts
 * @ai-sync: lib/admin/journal.ts
 */

import type { AdCampaignRow } from './ads'
import type { Signal } from './observe'
import type { TrackingCheck } from './tracking-check'

export interface VoorstelOnderbouwing {
  spend: number
  clicks: number
  impressions: number
  ctr: number | null
  visitors: number | null
  appStoreClicks: number | null
  costPerAppStoreClick: number | null
  /** Het signaal waaruit dit voorstel volgde, zodat de redenering navolgbaar blijft. */
  aanleiding: string
}

export interface Voorstel {
  campaignId: string
  actie: string
  motivatie: string
  /** Wat er misgaat als je dit doet en het was verkeerd. */
  risico: string
  onderbouwing: VoorstelOnderbouwing
  /** Klaar om als `voorstel` het journaal in te gaan. */
  body: {
    actie: string
    motivatie: string
    onderbouwing: VoorstelOnderbouwing
  }
}

export interface ProposalsInput {
  signalen: Signal[]
  rows: AdCampaignRow[]
  check: TrackingCheck
}

/**
 * @ai-why: Alleen deze codes leiden tot een voorstel, en de lijst is expliciet in plaats
 * van "alles wat niet ter-info is". Een nieuw signaal in lib/admin/observe.ts moet hier
 * bewust worden toegelaten; anders groeit deze laag stilzwijgend mee met elke signaal
 * die iemand toevoegt, en dat is precies waar een voorstellenmachine ongemerkt te veel
 * gaat vinden.
 */
const HANDELBAAR = new Set(['uitgaven_zonder_resultaat', 'kosten_per_klik_omhoog'])

export function buildProposals(input: ProposalsInput): Voorstel[] {
  const { signalen, rows, check } = input

  if (check.status === 'fout') return []

  const perId = new Map(rows.map((r) => [r.id, r]))
  const gedaan = new Set<string>()
  const voorstellen: Voorstel[] = []

  // @ai-gotcha: `signalen` komt uit buildSignals() en is daar al op ernst gesorteerd.
  // Deze lus leunt daarop: één voorstel per campagne betekent het voorstel dat bij het
  // ernstigste signaal hoort. Sorteer je die uitvoer ooit anders, dan verandert stil
  // welk voorstel je hier krijgt, zonder dat een test omvalt.
  for (const signaal of signalen) {
    if (!HANDELBAAR.has(signaal.code)) continue
    if (gedaan.has(signaal.campaignId)) continue

    const rij = perId.get(signaal.campaignId)
    // @ai-why: Een signaal over een campagne die niet in de huidige cijfers staat, levert
    // geen voorstel op. Zonder rij is er geen onderbouwing te bevriezen, en een voorstel
    // zonder cijfers eronder is een mening.
    if (!rij) continue

    // @ai-why: De poort per campagne, náást de accountbrede `check.status`-poort
    // hierboven. Die eerste is te grof: een campagne zonder GA4-rij levert alleen een
    // `waarschuwing` op, dus de accountstatus blijft groen en er kwam gewoon een
    // pauzeervoorstel uit over een campagne waarvan we het resultaat niet kennen. Dat is
    // exact het foutgeval in de kop van dit bestand. Risico is per campagne, dus de poort
    // hoort dat ook te zijn.
    if (rij.attribution !== 'gemeten') continue

    const voorstel = maak(signaal, rij)
    if (!voorstel) continue

    gedaan.add(signaal.campaignId)
    voorstellen.push(voorstel)
  }

  return voorstellen
}

function maak(signaal: Signal, rij: AdCampaignRow): Voorstel | null {
  const onderbouwing: VoorstelOnderbouwing = {
    spend: rij.spend,
    clicks: rij.clicks,
    impressions: rij.impressions,
    ctr: rij.ctr,
    visitors: rij.visitors,
    appStoreClicks: rij.appStoreClicks,
    costPerAppStoreClick: rij.costPerAppStoreClick,
    aanleiding: signaal.code,
  }

  if (signaal.code === 'uitgaven_zonder_resultaat') {
    return rond({
      campaignId: signaal.campaignId,
      actie: `Campagne ${rij.name} pauzeren`,
      motivatie: `€${rij.spend.toFixed(2)} uitgegeven en geen enkele app-store-klik. Dat is geld waarvan aantoonbaar niets terugkwam.`,
      risico: `Als de meting voor déze campagne stil kapot is en de klikken wel bestaan, pauzeer je iets dat werkt. Controleer eerst of hij utm_id draagt en of GA4 hem teruggeeft.`,
      onderbouwing,
    })
  }

  if (signaal.code === 'kosten_per_klik_omhoog') {
    // @ai-why: Bewust geen pauzeervoorstel. Duurder worden is normaal als een doelgroep
    // uitgeput raakt of de concurrentie opdroogt, en een campagne pauzeren gooit ook de
    // leerfase weg die het platform heeft opgebouwd. Uitzoeken is hier de goedkopere
    // eerste stap; pauzeren is de stap die je niet terugdraait door hem weer aan te
    // zetten.
    return rond({
      campaignId: signaal.campaignId,
      actie: `Campagne ${rij.name} nakijken: waarom kost een app-store-klik meer`,
      motivatie: signaal.boodschap,
      risico: `Er is nog geen reden om hier iets te wijzigen. Grijp je nu in, dan verandert er twee dingen tegelijk en weet je achteraf niet welke het deed.`,
      onderbouwing,
    })
  }

  return null
}

function rond(
  v: Omit<Voorstel, 'body'>,
): Voorstel {
  return {
    ...v,
    body: { actie: v.actie, motivatie: v.motivatie, onderbouwing: v.onderbouwing },
  }
}
