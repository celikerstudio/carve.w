/**
 * Laag B: wat is er sinds de vorige periode veranderd dat je moet weten.
 *
 * @ai-why: Dit is bewust een pure functie over twee periodes en geen scherm en geen
 * mailer. De aflevering (cockpit, mail, cron) mag veranderen zonder dat de beoordeling
 * verandert, en andersom is de beoordeling zo te testen zonder netwerk of database.
 *
 * @ai-why: Elke drempel hier bestaat om ruis tegen te houden, niet om gevallen te
 * vangen. Op Carve's volume is een procentuele sprong bijna altijd toeval: TDR-0006
 * rekende voor dat bij dertien accounts één account ongeveer 17 procentpunt is. Een
 * rapport dat elke dag iets meldt, wordt binnen een week niet meer gelezen, en dan is
 * het slechter dan geen rapport. Bij twijfel dus zwijgen.
 *
 * @ai-sync: lib/admin/ads.ts
 * @ai-sync: lib/admin/journal.ts
 */

import type { AdCampaignRow } from './ads'

/**
 * @ai-gotcha: Niet hetzelfde als `BevindingErnst` in lib/admin/journal.ts, die geen
 * `ter-info` kent. Ze heetten allebei `Ernst` en dan importeer je in een consument stil
 * de verkeerde. Een signaal mag informatief zijn; een bevinding in een controle niet,
 * want die betekent per definitie dat er iets stuk is.
 */
export type SignaalErnst = 'blokkerend' | 'waarschuwing' | 'ter-info'

export interface Signal {
  /** Stabiele sleutel, zodat hetzelfde signaal over de tijd te volgen is. */
  code: string
  ernst: SignaalErnst
  campaignId: string
  boodschap: string
}

export interface ObserveInput {
  /** De periode die je beoordeelt. */
  huidig: AdCampaignRow[]
  /** De even lange periode ervoor, als vergelijking. */
  vorig: AdCampaignRow[]
}

/**
 * @ai-why: Minstens tien app-store-klikken voordat een verandering in kosten per klik
 * gemeld wordt. Onder dat aantal beweegt het cijfer al tientallen procenten door één klik
 * meer of minder, en dan meld je de dobbelsteen. Tien is geen statistische grens maar een
 * ondergrens voor leesbaarheid; het echte antwoord is meer volume.
 */
const MIN_KLIKKEN_VOOR_VERGELIJKING = 10

/**
 * @ai-why: Pas melden bij de helft erbij of eraf, niet bij tien procent. Bij deze
 * aantallen is tien procent geen beweging maar afronding, en advertentieplatforms
 * schommelen van dag tot dag uit zichzelf.
 *
 * @ai-gotcha: De twee richtingen zijn niet even gevoelig, en dat is inherent aan een
 * relatief verschil. Omhoog gaat het af bij +50% (van 5 naar 7,50), omlaag pas bij een
 * halvering (van 5 naar 2,50). Verslechtering wordt dus eerder gemeld dan verbetering,
 * en dat is hier de goede kant om.
 */
const RELATIEVE_DREMPEL = 0.5

/**
 * @ai-why: Onder een tientje uitgeven zonder resultaat is geen probleem maar de eerste
 * dag van een campagne. Boven dat bedrag is het geld dat aantoonbaar niets deed.
 */
const MIN_UITGAVEN_ZONDER_RESULTAAT = 10

const RANG: Record<SignaalErnst, number> = { blokkerend: 0, waarschuwing: 1, 'ter-info': 2 }

function draait(rij: AdCampaignRow): boolean {
  return rij.spend > 0 || rij.impressions > 0
}

export function buildSignals(input: ObserveInput): Signal[] {
  const { huidig, vorig } = input
  const signalen: Signal[] = []
  const vorigePerId = new Map(vorig.map((r) => [r.id, r]))
  const huidigePerId = new Map(huidig.map((r) => [r.id, r]))

  for (const rij of huidig) {
    const eerder = vorigePerId.get(rij.id)

    // @ai-gotcha: Deze controle staat vóór alle andere en gebruikt `continue`. Een
    // stilgevallen campagne zou anders ook "kosten per klik omhoog" opleveren (nul
    // klikken tegen een eerdere waarde), en dan staan er twee signalen over één
    // gebeurtenis die naar verschillende oorzaken wijzen.
    if (eerder && draait(eerder) && !draait(rij)) {
      signalen.push({
        code: 'campagne_stilgevallen',
        ernst: 'waarschuwing',
        campaignId: rij.id,
        boodschap: `Campagne ${rij.name} gaf vorige periode ${euro(eerder.spend)} uit en deze periode niets. Budget op, afgelopen, of gepauzeerd.`,
      })
      continue
    }

    // @ai-why: De twee dure gevallen hieronder staan bewust vóór de `!eerder`-afhandeling.
    // Toen "nieuw" eerst kwam en meteen doorsprong, kreeg een gloednieuwe campagne die
    // vijfhonderd euro verbrandde zonder één app-store-klik het label `ter-info` en geen
    // enkel voorstel. Dat is precies het geval waarvoor deze laag bestaat, en juist bij
    // een nieuwe campagne is de kans het grootst dat er iets verkeerd staat.
    if (rij.spend >= MIN_UITGAVEN_ZONDER_RESULTAAT) {
      // @ai-why: "Niet gemeten" is iets anders dan "geen resultaat", en dat onderscheid
      // is hier het verschil tussen een goed en een schadelijk voorstel. Een campagne
      // zonder utm_id of zonder GA4-rij heeft `appStoreClicks: null`. Zou je die met
      // `?? 0` op nul zetten, dan meldt deze laag "gaf uit zonder resultaat", stelt
      // lib/admin/proposals.ts voor hem te pauzeren, en pauzeer je de campagne die wél
      // werkte maar niet geteld werd. Zie `Attribution` in lib/admin/ads.ts.
      if (rij.attribution !== 'gemeten') {
        signalen.push({
          code: 'uitgaven_buiten_meting',
          ernst: 'waarschuwing',
          campaignId: rij.id,
          boodschap: `Campagne ${rij.name} gaf ${euro(rij.spend)} uit en valt buiten de meting (${rij.attribution}). Over het resultaat valt niets te zeggen, in geen van beide richtingen.`,
        })
        continue
      }

      if (rij.appStoreClicks === 0) {
        signalen.push({
          code: 'uitgaven_zonder_resultaat',
          ernst: 'blokkerend',
          campaignId: rij.id,
          boodschap: `Campagne ${rij.name} gaf ${euro(rij.spend)} uit zonder één app-store-klik, terwijl de meting voor deze campagne wel werkt.`,
        })
        continue
      }
    }

    if (!eerder) {
      if (draait(rij)) {
        signalen.push({
          code: 'nieuwe_campagne',
          ernst: 'ter-info',
          campaignId: rij.id,
          boodschap: `Campagne ${rij.name} draait sinds deze periode en gaf ${euro(rij.spend)} uit.`,
        })
      }
      continue
    }

    // @ai-why: De drempel geldt op beide periodes. Alleen de huidige controleren zou een
    // campagne die van één naar twintig klikken gaat als "verslechterd" kunnen melden op
    // basis van die ene klik in de noemer van vorige week.
    const genoegVolume =
      (rij.appStoreClicks ?? 0) >= MIN_KLIKKEN_VOOR_VERGELIJKING &&
      (eerder.appStoreClicks ?? 0) >= MIN_KLIKKEN_VOOR_VERGELIJKING

    if (genoegVolume && rij.costPerAppStoreClick !== null && eerder.costPerAppStoreClick !== null) {
      const verschil = relatiefVerschil(eerder.costPerAppStoreClick, rij.costPerAppStoreClick)

      if (verschil !== null && verschil >= RELATIEVE_DREMPEL) {
        signalen.push({
          code: 'kosten_per_klik_omhoog',
          ernst: 'waarschuwing',
          campaignId: rij.id,
          boodschap: `Campagne ${rij.name} kost nu ${euro(rij.costPerAppStoreClick)} per app-store-klik, vorige periode ${euro(eerder.costPerAppStoreClick)}.`,
        })
      } else if (verschil !== null && verschil <= -RELATIEVE_DREMPEL) {
        signalen.push({
          code: 'kosten_per_klik_omlaag',
          ernst: 'ter-info',
          campaignId: rij.id,
          boodschap: `Campagne ${rij.name} kost nu ${euro(rij.costPerAppStoreClick)} per app-store-klik, vorige periode ${euro(eerder.costPerAppStoreClick)}.`,
        })
      }
    }
  }

  // @ai-why: Een campagne die helemaal uit de huidige periode verdween krijgt hetzelfde
  // signaal als een die op nul viel. Meta laat een campagne zonder vertoningen soms
  // gewoon weg uit de rapportage in plaats van hem met nullen terug te geven, en die twee
  // gevallen zijn voor de lezer hetzelfde nieuws.
  for (const eerder of vorig) {
    if (!huidigePerId.has(eerder.id) && draait(eerder)) {
      signalen.push({
        code: 'campagne_stilgevallen',
        ernst: 'waarschuwing',
        campaignId: eerder.id,
        boodschap: `Campagne ${eerder.name} gaf vorige periode ${euro(eerder.spend)} uit en komt deze periode niet meer terug uit Meta.`,
      })
    }
  }

  return signalen.sort((a, b) => RANG[a.ernst] - RANG[b.ernst])
}

/**
 * @ai-gotcha: Geeft `null` bij een noemer van nul in plaats van Infinity, net als `deel`
 * in lib/admin/ads.ts. Van nul naar iets is geen percentage maar een ander verhaal, en
 * dat verhaal wordt hierboven door een eigen signaal verteld.
 */
function relatiefVerschil(van: number, naar: number): number | null {
  if (van === 0) return null
  return (naar - van) / van
}

function euro(bedrag: number): string {
  return `€${bedrag.toFixed(2)}`
}
