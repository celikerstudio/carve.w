/**
 * Klopt de meting zelf nog. Eén controle die zegt wat er kapot is en waar je moet zijn.
 *
 * @ai-why: Dit staat vóór alle andere lagen omdat de fout hier onherstelbaar is. TDR-0009
 * zegt het al: wat niet in de link stond op het moment dat er geklikt werd, is achteraf
 * niet meer terug te halen. Een campagne die een week zonder `utm_id` draait, is een week
 * uitgaven waarvan je nooit meer zult weten wat ze opleverden. Elk ander cijfer op de
 * cockpit kun je later opnieuw ophalen; dit niet.
 *
 * @ai-why: De uitkomst gaat als `controle`-regel het journaal in. Daardoor zie je niet
 * alleen dat het nú rood staat, maar ook sinds wanneer, en dat is precies het verschil
 * tussen "repareren" en "weten hoeveel uitgaven eronder zijn weggelekt".
 *
 * @ai-sync: lib/admin/journal.ts
 * @ai-sync: lib/admin/ads.ts
 * @ai-sync: docs/tdr/0009-campagnerendement-komt-uit-ga4.md
 */

import type { Ga4Campaign, MetaCampaign } from './ads'
import type { Bevinding, BevindingErnst, ControleBody } from './journal'

export type { Bevinding, BevindingErnst }

/**
 * @ai-why: Afgeleid van het zod-schema in lib/admin/journal.ts in plaats van hier
 * opnieuw opgeschreven. Twee losse definities liepen uiteen: hier typecheckte een derde
 * ernstgraad prima, en pas bij het wegschrijven weigerde het journaal hem.
 */
export type TrackingCheck = ControleBody

export interface TrackingCheckInput {
  campaigns: MetaCampaign[]
  ga4Rows: Ga4Campaign[]
  /**
   * Alle bezoekers van de site over de periode, accountbreed uit GA4.
   *
   * @ai-gotcha: Niet de som van `ga4Rows`. Die rijen tellen alleen campagneverkeer, dus
   * met nul campagnes is die som nul en kon de controle hieronder nooit afgaan --
   * precies in de fase waarin je hem het hardst nodig hebt. Bovendien telt een bezoeker
   * die via twee campagnes binnenkwam in beide rijen mee, dus die som is ook mét
   * campagnes de verkeerde noemer (TDR-0009, consequenties).
   */
  bezoekersTotaal: number
  /** Alle `app_store_click`-events over de periode, ook die zonder campagne. */
  appStoreClicksTotaal: number
}

/**
 * @ai-why: "Loopt" is uitgeven of vertoond worden, niet de status in Ads Manager. Een
 * campagne die op actief staat maar niets uitgeeft, heeft nog geen enkele klik geleverd
 * en er valt dus ook nog niets te meten. Zou je op de status afgaan, dan staat de
 * controle rood vanaf het moment dat je een campagne aanmaakt tot je hem publiceert, en
 * een lamp die standaard rood is wordt niet meer gelezen.
 */
function loopt(campagne: MetaCampaign): boolean {
  return campagne.spend > 0 || campagne.impressions > 0
}

export function buildTrackingCheck(input: TrackingCheckInput): TrackingCheck {
  const { campaigns, ga4Rows, bezoekersTotaal, appStoreClicksTotaal } = input
  const bevindingen: Bevinding[] = []
  const perId = new Map(ga4Rows.map((r) => [r.campaignId, r]))
  const lopend = campaigns.filter(loopt)

  for (const campagne of lopend) {
    if (!campagne.tagged) {
      bevindingen.push({
        code: 'utm_id_ontbreekt',
        ernst: 'blokkerend',
        boodschap: `Campagne ${campagne.name} heeft geen utm_id in de url_tags van zijn advertenties. Zolang dat zo is, is deze uitgave niet aan een resultaat te koppelen en valt dat achteraf niet te repareren.`,
      })
      continue
    }

    // @ai-why: Alleen als de tag er wél staat is een lege GA4-rij informatief. Zonder de
    // controle op `tagged` zou dezelfde campagne twee bevindingen krijgen die naar
    // dezelfde oorzaak wijzen, en dan ga je in de verkeerde hoek zoeken. Dit is hetzelfde
    // onderscheid als `Attribution` in lib/admin/ads.ts maakt.
    if (!perId.has(campagne.id)) {
      bevindingen.push({
        code: 'geen_ga4_rij',
        ernst: 'waarschuwing',
        boodschap: `Campagne ${campagne.name} geeft uit maar komt niet terug uit GA4. Op klein volume kan dat GA4's drempel zijn; blijft het staan bij honderden klikken, dan komt het verkeer niet aan of wordt de cookiebanner geweigerd.`,
      })
    }
  }

  // @ai-why: Accountbreed en niet per campagne. `app_store_click` vuurt ook op organisch
  // verkeer, dus als het event stil is terwijl er wél bezoek is, zit de fout in de knop
  // of in GA4 en niet in een advertentie. Daarom moet deze controle het ook doen als er
  // nog geen enkele campagne draait: TDR-0006 zegt dat de custom dimension niet met
  // terugwerkende kracht werkt, dus dit is precies het moment waarop je het wilt weten.
  // De bezoekersdrempel voorkomt dat hij rood staat op een dag zonder verkeer; dat is
  // geen storing maar een rustige dag.
  if (bezoekersTotaal > 0 && appStoreClicksTotaal === 0) {
    bevindingen.push({
      code: 'app_store_click_stil',
      ernst: 'blokkerend',
      boodschap: `${bezoekersTotaal} bezoekers en geen enkele app_store_click. Het event vuurt niet, of het staat niet als event-scoped custom dimension in GA4. Dat laatste werkt niet met terugwerkende kracht.`,
    })
  }

  return { status: ernstigste(bevindingen), bevindingen }
}

/**
 * @ai-why: Eén blokkerende bevinding maakt de hele controle fout, ongeacht hoeveel er
 * goed gaat. Een gemiddelde of een percentage zou hier zacht zijn over precies het geval
 * waar je meteen op moet handelen.
 */
function ernstigste(bevindingen: Bevinding[]): TrackingCheck['status'] {
  if (bevindingen.some((b) => b.ernst === 'blokkerend')) return 'fout'
  if (bevindingen.length > 0) return 'waarschuwing'
  return 'goed'
}
