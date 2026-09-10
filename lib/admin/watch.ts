/**
 * De ronde die de vier lagen aan elkaar knoopt: controleer, vergelijk, sluit af, stel voor.
 *
 * @ai-why: Puur en zonder netwerk of database, net als de lagen eronder. De aanroeper
 * haalt de bronnen op en schrijft het resultaat weg; hier zit alleen het oordeel. Dat is
 * wat deze ronde testbaar houdt zonder Meta, GA4 of Supabase erbij te halen, en het is
 * de reden dat je de aflevering (cockpit, cron, mail) kunt veranderen zonder dat er iets
 * aan de beoordeling verschuift.
 *
 * @ai-why: De volgorde is niet vrij. De tracking-check draait eerst en de voorstellen
 * lezen zijn uitkomst, want een voorstel op kapotte meting is erger dan geen voorstel.
 * Zie lib/admin/proposals.ts voor waarom dat de belangrijkste eigenschap van laag D is.
 *
 * @ai-sync: lib/admin/tracking-check.ts
 * @ai-sync: lib/admin/observe.ts
 * @ai-sync: lib/admin/experiments.ts
 * @ai-sync: lib/admin/proposals.ts
 * @ai-sync: lib/admin/journal.ts
 */

import type { AdCampaignRow, Ga4Campaign, MetaCampaign } from './ads'
import { buildTestConclusions, type TestConclusie, type Venster } from './experiments'
import type { JournalEvent, JournalKind } from './journal'
import { buildSignals, type Signal } from './observe'
import { buildProposals, type Voorstel } from './proposals'
import { buildTrackingCheck, type TrackingCheck } from './tracking-check'

/** Een regel die klaarstaat om het journaal in te gaan. `id`, `at` en `ref` zet de store. */
export interface NieuweGebeurtenis {
  kind: JournalKind
  campaignId: string | null
  body: unknown
}

export interface WatchInput {
  campaigns: MetaCampaign[]
  ga4Rows: Ga4Campaign[]
  /** De periode die je beoordeelt, als tabelrijen. */
  huidig: AdCampaignRow[]
  /** De even lange periode ervoor. */
  vorig: AdCampaignRow[]
  /** Alle bezoekers over de periode, accountbreed. Niet de som van `ga4Rows`. */
  bezoekersTotaal: number
  appStoreClicksTotaal: number
  /**
   * Het journaal zoals het nu is, of `null` als het niet gelezen kon worden.
   *
   * @ai-why: Expliciet nullable, zodat een mislukte lees niet als lege lijst kan
   * binnenkomen. Dit was een echte bug: readJournal gaf `[]` bij een fout, deze ronde las
   * dat als "er is nog nooit iets vastgelegd" en schreef de controle en elk openstaand
   * voorstel opnieuw weg. De tabel heeft geen DELETE-policy, dus dat is permanent. Het
   * type dwingt de aanroeper nu om het onderscheid te maken.
   */
  journaal: JournalEvent[] | null
  /** De periode die `huidig` beslaat. Bepaalt of een testuitkomst iets mag zeggen. */
  venster?: Venster
  /** Kalenderdag als `YYYY-MM-DD`. */
  vandaag: string
}

/**
 * @ai-why: Een voorstel wordt binnen dertig dagen niet herhaald, maar daarna wel. Zonder
 * bovengrens werd een voorstel dat je ooit hebt weggeklikt nooit meer gedaan, ook niet
 * als hetzelfde probleem een halfjaar later terugkomt. En zonder expliciete grens erfde
 * het ontdubbelen stilzwijgend de leeslimiet van readJournal: zodra het journaal boven
 * de 500 regels kwam, vielen oude voorstellen uit het venster en kwamen ze vanzelf terug.
 */
const VOORSTEL_HERHAALVENSTER_DAGEN = 30

export interface WatchRun {
  /** Onwaar als het journaal niet gelezen kon worden. Dan is `events` altijd leeg. */
  journaalGelezen: boolean
  check: TrackingCheck
  signalen: Signal[]
  /** Tests waarvan de looptijd om is. Deze worden getóónd, niet weggeschreven. */
  conclusies: TestConclusie[]
  voorstellen: Voorstel[]
  /** Wat er daadwerkelijk aan het journaal toegevoegd moet worden. */
  events: NieuweGebeurtenis[]
}

export function buildWatchRun(input: WatchInput): WatchRun {
  const {
    campaigns,
    ga4Rows,
    huidig,
    vorig,
    bezoekersTotaal,
    appStoreClicksTotaal,
    journaal,
    venster,
    vandaag,
  } = input

  const check = buildTrackingCheck({ campaigns, ga4Rows, bezoekersTotaal, appStoreClicksTotaal })
  const signalen = buildSignals({ huidig, vorig })
  const voorstellen = buildProposals({ signalen, rows: huidig, check })

  // @ai-why: Zonder journaal wordt er beoordeeld maar niet geschreven. De check en de
  // signalen rusten alleen op de bronnen en blijven dus geldig; alles wat geheugen nodig
  // heeft (welke tests lopen, wat is al voorgesteld, wat stond er al vast) kan niet
  // kloppen en levert daarom niets op. Half schrijven is hier de gevaarlijke optie.
  if (!journaal) {
    return { journaalGelezen: false, check, signalen, conclusies: [], voorstellen, events: [] }
  }

  const conclusies = buildTestConclusions(journaal, huidig, vandaag, venster)

  const events: NieuweGebeurtenis[] = []

  // @ai-why: Alleen wegschrijven als de uitkomst afwijkt van de vorige controle. Een
  // ronde die elke dag draait zou anders 365 identieke "goed"-regels per jaar opleveren,
  // en dan is de tijdlijn onleesbaar precies op het moment dat je hem nodig hebt. Zo
  // staat er één regel per verandering, en die zegt meteen sinds wanneer het zo is.
  if (checkVeranderde(check, laatsteControle(journaal))) {
    events.push({ kind: 'controle', campaignId: null, body: check })
  }

  // @ai-why: Conclusies gaan bewust níét als afsluiting het journaal in. Een afsluiting
  // vereist een `besluit` en dat weigert het journaal leeg (lib/admin/journal.ts). Een
  // test die vanzelf "afgesloten" wordt zonder dat iemand een conclusie trok, is een test
  // waar je niets van geleerd hebt. Ze worden hier alleen zichtbaar gemaakt.

  const grens = new Date(
    Date.parse(`${vandaag}T00:00:00Z`) - VOORSTEL_HERHAALVENSTER_DAGEN * 24 * 60 * 60 * 1000,
  ).toISOString()

  const alVoorgesteld = new Set(
    journaal
      .filter((e) => e.kind === 'voorstel' && e.at >= grens)
      .map((e) => sleutelVan(e.campaignId, (e.body as { actie?: unknown } | null)?.actie)),
  )

  for (const voorstel of voorstellen) {
    // @ai-gotcha: Ontdubbelen op campagne plus actietekst, niet op campagne alleen. Op
    // campagne alleen zou een nieuw en ánder voorstel over dezelfde campagne stil
    // verdwijnen zodra er ooit één is gedaan. De actietekst draagt de campagnenaam, dus
    // een hernoeming in Ads Manager levert eenmalig een herhaling op. Dat is de zachtere
    // fout van de twee.
    if (alVoorgesteld.has(sleutelVan(voorstel.campaignId, voorstel.actie))) continue
    events.push({ kind: 'voorstel', campaignId: voorstel.campaignId, body: voorstel.body })
  }

  return { journaalGelezen: true, check, signalen, conclusies, voorstellen, events }
}

function sleutelVan(campaignId: string | null, actie: unknown): string {
  return `${campaignId ?? ''}::${typeof actie === 'string' ? actie : ''}`
}

function laatsteControle(journaal: JournalEvent[]): TrackingCheck | null {
  const controles = journaal.filter((e) => e.kind === 'controle')
  if (controles.length === 0) return null

  // @ai-gotcha: Zelf op `at` sorteren en niet vertrouwen op de volgorde waarin de
  // aanroeper het journaal aanlevert. Een lijst die per ongeluk oplopend binnenkomt zou
  // hier de oudste controle als "laatste" opleveren, en dan schrijft de ronde stilletjes
  // een regel weg (of juist niet) op basis van maanden oude informatie.
  const nieuwste = controles.reduce((a, b) => (a.at >= b.at ? a : b))
  return nieuwste.body as TrackingCheck
}

/**
 * @ai-why: Vergelijkt status én de verzameling bevindingscodes, niet de hele body. De
 * boodschappen dragen cijfers ("€80 uitgegeven") en die schuiven elke dag een beetje op;
 * daarop vergelijken zou elke dag een nieuwe regel opleveren en het ontdubbelen nutteloos
 * maken. De codes zijn juist stabiel gehouden om hier op te kunnen vergelijken.
 */
function checkVeranderde(nu: TrackingCheck, eerder: TrackingCheck | null): boolean {
  if (!eerder) return true
  if (nu.status !== eerder.status) return true

  const codes = (c: TrackingCheck) =>
    [...new Set((c.bevindingen ?? []).map((b) => b.code))].sort().join('|')

  return codes(nu) !== codes(eerder)
}
