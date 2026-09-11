/**
 * De enige plek in deze codebase die geld kan uitgeven.
 *
 * @ai-why: Buiten `lib/admin/sources/` en niet erin. Die map betekent hier "leesbron met
 * SourceResult en failure-isolatie" (lib/admin/sources/source.ts). Een schrijfmodule
 * ertussen zou precies de helderheid verwateren die dit bestand moet bieden: één grep op
 * `meta-write` laat zien wat er aan een advertentieaccount kan tornen.
 *
 * @ai-why: Exact twee geëxporteerde functies, en dat is een grens en geen toeval. TDR-0011
 * beslissing 1 sluit creatives, doelgroepen en targeting uit; zonder harde grens hier is
 * dat over een half jaar een lijst van vijf en bouwen we Ads Manager na.
 *
 * @ai-gotcha: Het token gaat in de Authorization-header en niet in de query-string, anders
 * dan lib/admin/sources/meta.ts dat voor lezen doet. URL's landen in proxy-, edge- en
 * foutlogs, en dit token kan campagnes pauzeren.
 *
 * @ai-sync: docs/tdr/0011-de-cockpit-bedient-de-campagnes.md
 * @ai-sync: lib/admin/budget.ts
 * @ai-sync: app/actions/admin/ads-control.ts
 */

import { plafondVan } from './budget'
import type { CampagneBudget } from './ads'

const API_VERSION = 'v21.0'

export const META_WRITE_ENV = 'META_WRITE_TOKEN'

/**
 * @ai-why: `onbekend` is geen detail maar de kern van TDR-0011 beslissing 10. Een timeout
 * of een 500 ná toepassing is niet te onderscheiden van "niet gebeurd". Zou dit een kale
 * boolean zijn, dan behandelt de aanroeper het onbepaalde geval als een nette mislukking,
 * en dan staat er niets in het journaal over een wijziging die wél is doorgevoerd.
 */
export type WriteUitkomst =
  | { ok: true; waargenomen: CampagneBudget }
  | { ok: false; probleem: string; onbekend: boolean }

export function schrijvenMogelijk(): boolean {
  const token = process.env[META_WRITE_ENV]
  return Boolean(token && token.trim() !== '')
}

function token(): string {
  const waarde = process.env[META_WRITE_ENV]
  if (!waarde || waarde.trim() === '') {
    throw new Error(`Niet gekoppeld. Zet ${META_WRITE_ENV} in de omgeving.`)
  }
  return waarde
}

async function graph(
  pad: string,
  init: { method: 'GET' | 'POST'; body?: Record<string, string> },
): Promise<unknown> {
  const url = new URL(`https://graph.facebook.com/${API_VERSION}/${pad}`)

  const res = await fetch(url, {
    method: init.method,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token()}`,
      ...(init.body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: init.body ? new URLSearchParams(init.body) : undefined,
  })

  const json: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    // @ai-why: Meta's eigen tekst wordt doorgegeven en niet vervangen. Die meldt precies
    // waarom iets geweigerd is (verlaging onder wat er vandaag al uit is, looptijdbudget,
    // bereikt spending limit), en dit scherm heeft één lezer die het zelf moet oplossen.
    const bericht =
      (json as { error?: { message?: string } } | null)?.error?.message ??
      `Meta gaf ${res.status}`
    throw new MetaFout(bericht, res.status >= 500)
  }

  return json
}

class MetaFout extends Error {
  constructor(
    bericht: string,
    readonly onbekend: boolean,
  ) {
    super(bericht)
    this.name = 'MetaFout'
  }
}

const CAMPAGNE_VELDEN = 'id,status,effective_status,daily_budget,lifetime_budget'

async function leesCampagne(campaignId: string): Promise<CampagneBudget> {
  const json = (await graph(`${campaignId}?fields=${CAMPAGNE_VELDEN}`, { method: 'GET' })) as {
    status?: string
    effective_status?: string
    daily_budget?: string
    lifetime_budget?: string
  } | null

  const looptijd = Number(json?.lifetime_budget ?? 0) > 0
  const dag = Number(json?.daily_budget ?? 0)

  return {
    status: json?.status ?? 'UNKNOWN',
    effectiveStatus: json?.effective_status ?? 'UNKNOWN',
    dailyBudgetMinor: looptijd || dag <= 0 ? null : dag,
  }
}

/**
 * @ai-why: Lezen, vergelijken, schrijven, terugleen. De vergelijking vlak vóór de write is
 * TDR-0011 beslissing 6: Meta kent geen conditionele update, dus dit is de enige manier om
 * te voorkomen dat het journaal een van-naar vastlegt die nooit heeft bestaan omdat er
 * ondertussen in Ads Manager iets veranderde.
 *
 * @ai-why: De terugleesstap is beslissing 10. Wat er in het journaal komt is wat Meta
 * daarna zégt, niet wat wij bedoelden. Faalt die stap, dan is de uitkomst onbekend en zegt
 * de aanroeper dat, in plaats van te doen alsof het gelukt of mislukt is.
 */
async function schrijf(
  campaignId: string,
  controle: (huidig: CampagneBudget) => string | null,
  body: Record<string, string>,
): Promise<WriteUitkomst> {
  let huidig: CampagneBudget
  try {
    huidig = await leesCampagne(campaignId)
  } catch (e) {
    // @ai-gotcha: Mislukt het lézen, dan is er zeker niets geschreven. Dat is het enige
    // geval in dit bestand waar `onbekend: false` gegarandeerd klopt.
    return { ok: false, probleem: melding(e), onbekend: false }
  }

  const bezwaar = controle(huidig)
  if (bezwaar) return { ok: false, probleem: bezwaar, onbekend: false }

  try {
    await graph(campaignId, { method: 'POST', body })
  } catch (e) {
    return { ok: false, probleem: melding(e), onbekend: e instanceof MetaFout ? e.onbekend : true }
  }

  try {
    return { ok: true, waargenomen: await leesCampagne(campaignId) }
  } catch (e) {
    return {
      ok: false,
      probleem: `De wijziging is naar Meta gestuurd, maar de controle daarna lukte niet: ${melding(e)}`,
      onbekend: true,
    }
  }
}

function melding(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

export async function setCampaignStatus(
  campaignId: string,
  naar: 'ACTIVE' | 'PAUSED',
  verwachteHuidige: string,
): Promise<WriteUitkomst> {
  return schrijf(
    campaignId,
    (huidig) =>
      huidig.status === verwachteHuidige
        ? null
        : `De campagne staat inmiddels op ${huidig.status} en niet op ${verwachteHuidige}. Iemand of iets heeft hem ondertussen aangeraakt; ververs en kijk opnieuw.`,
    { status: naar },
  )
}

export async function setCampaignDailyBudget(
  campaignId: string,
  naarMinor: number,
  verwachteHuidigeMinor: number | null,
  valuta: string,
): Promise<WriteUitkomst> {
  const plafond = plafondVan(valuta)

  return schrijf(
    campaignId,
    (huidig) => {
      // @ai-why: Deze controle staat hier en niet alleen in de UI. Een server action is een
      // publiek HTTP-endpoint, dus het plafond dat alleen in een formulier leeft is geen
      // plafond. Zie TDR-0011 beslissing 5.
      if (naarMinor > plafond) {
        return `Dagbudget boven het plafond van ${plafond} (in de kleinste eenheid van ${valuta}). Verhogen kan, maar dat is een codewijziging in lib/admin/budget.ts.`
      }
      if (naarMinor <= 0) return 'Een dagbudget van nul is geen budgetwijziging maar pauzeren.'
      if (huidig.dailyBudgetMinor === null) {
        return 'Deze campagne heeft geen campagnebudget. Het dagbudget staat dan bij Meta op de ad set, of het is een looptijdbudget; in beide gevallen kun je het hier niet zetten.'
      }
      if (huidig.dailyBudgetMinor !== verwachteHuidigeMinor) {
        return `Het dagbudget staat inmiddels op ${huidig.dailyBudgetMinor} en niet op ${verwachteHuidigeMinor}. Ververs en kijk opnieuw.`
      }
      return null
    },
    { daily_budget: String(naarMinor) },
  )
}
