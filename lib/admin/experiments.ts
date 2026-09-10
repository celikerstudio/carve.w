/**
 * Laag C: welke tests zijn uitgelopen, en wat kwam eruit.
 *
 * @ai-why: Deze module wijst met opzet géén winnaar aan. Bij Carve's volume is elk
 * significantieoordeel een verzonnen zekerheid: TDR-0006 rekende voor dat één account
 * ongeveer 17 procentpunt is, en GA4 vouwt campagnerijen met weinig gebruikers weg in
 * een `(other)`-rij. Een functie die hier "variant B wint" zegt, zegt dat over ruis, en
 * dat is schadelijker dan niets zeggen omdat het eruitziet als een meting. Wat hij wél
 * doet: de looptijd bewaken, de cijfers bevriezen, en zeggen of er überhaupt genoeg
 * volume was om iets te mogen vinden. Het besluit blijft van jou en gaat het journaal in.
 *
 * @ai-why: `besluit` komt er leeg uit en het journaal weigert een lege afsluiting
 * (lib/admin/journal.ts). Dat is geen ongemak maar de bedoeling: een test die afloopt en
 * waar niemand een conclusie aan verbindt, is een test die je niet had moeten doen. De
 * validatie dwingt af dat er een mens aan te pas komt.
 *
 * @ai-sync: lib/admin/journal.ts
 * @ai-sync: lib/admin/ads.ts
 */

import type { AdCampaignRow } from './ads'
import { openTests, type JournalEvent } from './journal'

/**
 * @ai-why: Dezelfde ondergrens als in lib/admin/observe.ts, en om dezelfde reden: onder
 * tien app-store-klikken beweegt elk afgeleid cijfer al tientallen procenten door één
 * klik meer of minder. Bewust gedupliceerd en niet gedeeld: het is toeval dat de twee
 * getallen nu gelijk zijn. Observe bewaakt of een verandering het melden waard is, dit
 * bewaakt of een test iets mocht aantonen. Die twee mogen los bewegen.
 */
const MIN_KLIKKEN_VOOR_UITSPRAAK = 10

export interface TestCijfers {
  spend: number
  clicks: number
  impressions: number
  ctr: number | null
  visitors: number | null
  appStoreClicks: number | null
  costPerAppStoreClick: number | null
}

/** De periode die de meegeleverde cijfers beslaan. */
export interface Venster {
  /** Eerste dag, `YYYY-MM-DD`. */
  van: string
  /** Eerste dag ná de periode, `YYYY-MM-DD`. Zelfde exclusieve lezing als `loopttot`. */
  tot: string
}

export interface TestConclusie {
  /** De `test`-gebeurtenis die hiermee afgesloten wordt. Wordt de `ref` van de afsluiting. */
  testId: string
  campaignId: string | null
  cijfers: TestCijfers
  /**
   * Dekken de meegeleverde cijfers de hele looptijd van de test.
   *
   * @ai-why: buildWatchRun gaf hier eerst zonder meer het rapportagevenster mee (7 of 30
   * dagen). Bij een test van veertien dagen bevroor dat de halve looptijd in een
   * `afsluiting`-regel die nooit meer te corrigeren is, en dat getal ziet er achteraf
   * even gezaghebbend uit als een goed getal. Nu wordt het benoemd.
   */
  dektDeLooptijd: boolean
  /** Was er genoeg volume om de uitkomst serieus te nemen. */
  genoegVolume: boolean
  uitkomst: string
  /** Altijd leeg. Jij vult hem in; het journaal weigert hem leeg. */
  besluit: ''
  /** Klaar om, met een ingevuld `besluit`, als afsluiting het journaal in te gaan. */
  body: { uitkomst: string; besluit: ''; cijfers: TestCijfers }
}

interface TestBody {
  startte?: unknown
  loopttot?: unknown
  criterium?: unknown
}

/**
 * @ai-gotcha: Geen venster meegegeven betekent "ik weet niet welke periode deze cijfers
 * beslaan", en dat telt als niet-dekkend. Zou het standaard `true` zijn, dan glipt elke
 * aanroeper die het vergeet stilzwijgend door met een uitspraak die nergens op rust.
 */
function dekt(venster: Venster | undefined, test: JournalEvent): boolean {
  if (!venster) return false
  const body = test.body as TestBody | null
  if (typeof body?.startte !== 'string' || typeof body?.loopttot !== 'string') return false
  return venster.van <= body.startte && venster.tot >= body.loopttot
}

/**
 * @param events Alle journaalregels; open tests worden hieruit afgeleid.
 * @param rows De campagnecijfers over de looptijd van de test.
 * @param vandaag Kalenderdag als `YYYY-MM-DD`.
 *
 * @ai-gotcha: `vandaag` wordt doorgegeven en niet hier bepaald. Een functie die zelf
 * `new Date()` aanroept is niet te testen zonder de klok te stubben, en dat is precies
 * het soort test dat groen blijft terwijl de logica stuk is.
 */
export function buildTestConclusions(
  events: JournalEvent[],
  rows: AdCampaignRow[],
  vandaag: string,
  venster?: Venster,
): TestConclusie[] {
  const perId = new Map(rows.map((r) => [r.id, r]))

  return openTests(events)
    .filter((test) => verlopen(test, vandaag))
    .map((test) => {
      const rij = test.campaignId ? perId.get(test.campaignId) : undefined
      const cijfers = bevries(rij)
      const dektDeLooptijd = dekt(venster, test)
      // @ai-why: Dekt het venster de looptijd niet, dan is `genoegVolume` per definitie
      // onwaar, hoeveel klikken er ook in staan. Genoeg klikken over de verkeerde periode
      // is geen bewijs, en dit is de enige plek die dat kan tegenhouden voordat het als
      // conclusie het journaal in gaat.
      const genoegVolume =
        dektDeLooptijd && (cijfers.appStoreClicks ?? 0) >= MIN_KLIKKEN_VOOR_UITSPRAAK
      const uitkomst = beschrijf(rij, genoegVolume, dektDeLooptijd, criteriumVan(test))

      return {
        testId: test.id,
        campaignId: test.campaignId,
        cijfers,
        dektDeLooptijd,
        genoegVolume,
        uitkomst,
        besluit: '' as const,
        body: { uitkomst, besluit: '' as const, cijfers },
      }
    })
}

/**
 * @ai-gotcha: Vergelijking op de kalenderdag-string en niet op `Date`-objecten. Beide
 * kanten zijn `YYYY-MM-DD`, dus lexicografisch vergelijken geeft hetzelfde antwoord
 * zonder dat er een tijdzone aan te pas komt. Zou je hier `Date.parse` gebruiken, dan
 * verschuift de einddatum voor een lezer buiten UTC met een dag.
 */
function verlopen(test: JournalEvent, vandaag: string): boolean {
  const loopttot = (test.body as TestBody | null)?.loopttot
  if (typeof loopttot !== 'string') return false
  return vandaag >= loopttot
}

function criteriumVan(test: JournalEvent): string | null {
  const criterium = (test.body as TestBody | null)?.criterium
  return typeof criterium === 'string' ? criterium : null
}

function bevries(rij: AdCampaignRow | undefined): TestCijfers {
  if (!rij) {
    return {
      spend: 0,
      clicks: 0,
      impressions: 0,
      ctr: null,
      visitors: null,
      appStoreClicks: null,
      costPerAppStoreClick: null,
    }
  }
  return {
    spend: rij.spend,
    clicks: rij.clicks,
    impressions: rij.impressions,
    ctr: rij.ctr,
    visitors: rij.visitors,
    appStoreClicks: rij.appStoreClicks,
    costPerAppStoreClick: rij.costPerAppStoreClick,
  }
}

/**
 * @ai-why: De tekst herhaalt het criterium in plaats van het toe te passen. Jij hebt
 * vooraf opgeschreven waarop je zou besluiten; dit zet dat naast de cijfers zodat je je
 * eigen regel niet achteraf kunt oprekken. Dat oprekken is de meest voorkomende manier
 * waarop een test zichzelf bevestigt.
 */
function beschrijf(
  rij: AdCampaignRow | undefined,
  genoegVolume: boolean,
  dektDeLooptijd: boolean,
  criterium: string | null,
): string {
  if (!rij) {
    return 'De campagne komt niet meer terug uit de cijfers, dus over de uitkomst valt niets te zeggen. Mogelijk is hij gepauzeerd of verwijderd voordat de looptijd om was.'
  }

  const staart = criterium ? ` Je criterium vooraf was: ${criterium}.` : ''

  if (!dektDeLooptijd) {
    return `Looptijd verstreken, maar de cijfers hiernaast beslaan een andere periode dan de test. Ze zeggen dus niets over de uitkomst; lees ze in Ads Manager over de looptijd zelf.${staart}`
  }

  if (!genoegVolume) {
    return `Looptijd verstreken met ${rij.appStoreClicks ?? 0} app-store-klikken. Dat is te weinig om een verschil aan toe te schrijven; wat je hier ziet kan toeval zijn.${staart}`
  }

  return `Looptijd verstreken met ${rij.appStoreClicks ?? 0} app-store-klikken uit ${rij.clicks} klikken.${staart}`
}
