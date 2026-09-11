'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { naarMinorUnit } from '@/lib/admin/budget'
import { parseJournalBody, type JournalEvent } from '@/lib/admin/journal'
import { appendEvent, readJournal } from '@/lib/admin/journal-store'
import {
  schrijvenMogelijk,
  setCampaignDailyBudget,
  setCampaignStatus,
  type WriteUitkomst,
} from '@/lib/admin/meta-write'
import { loadAccountCurrency } from '@/lib/admin/sources/meta'

/**
 * De handelingen uit TDR-0011: pauzeren, budget, en los vastleggen.
 *
 * @ai-why: De volgorde in `voerUit` is de hele TDR in vijf stappen, en elke stap staat er
 * om een concrete reden: valideren vóór Meta (beslissing 5, anders levert een body die zod
 * niet haalt een doorgevoerde wijziging met een lege tijdlijn op), ontdubbelen (beslissing
 * 12, want een dubbele regel in een tabel zonder DELETE-policy is permanent), Meta met
 * terugleen (beslissing 7 en 10), en dan pas het journaal met de wáárgenomen waarde.
 *
 * @ai-gotcha: `requireAdmin()` staat als eerste regel in elke geëxporteerde functie. Een
 * server action is een publiek HTTP-endpoint; de knop in de cockpit is niet de enige
 * ingang en de rolcontrole hoort daarom hier en niet in de UI.
 *
 * @ai-sync: lib/admin/meta-write.ts
 * @ai-sync: lib/admin/journal.ts
 * @ai-sync: docs/tdr/0011-de-cockpit-bedient-de-campagnes.md
 */

/**
 * @ai-why: Vijf minuten. Lang genoeg om een dubbelklik en een tweede tab te vangen, kort
 * genoeg dat je een echte correctie binnen dezelfde sessie nog kunt vastleggen. De
 * ontdubbeling in lib/admin/watch.ts geldt voor voorstellen en controles, niet hiervoor.
 */
const ONTDUBBEL_VENSTER_MS = 5 * 60 * 1000

export interface WijzigingInvoer {
  wat: string
  waarom: string
  verwacht: string
}

export type ControlResult =
  | { ok: true; melding: string }
  /** `vastgelegd` zegt of de journaalregel er wél kwam; `onbekend` of Meta het deed. */
  | { ok: false; probleem: string; vastgelegd: boolean; onbekend: boolean }

export async function knoppenBeschikbaar(): Promise<boolean> {
  await requireAdmin()
  return schrijvenMogelijk()
}

/**
 * Beslissing 11: leg vast wat je elders deed. Raakt Meta niet.
 *
 * @ai-why: Geen token, geen scope, geen risico, en het dekt de wijzigingen waar nooit een
 * knop voor komt: creatives, doelgroepen, targeting. Dat is juist de categorie met de
 * grootste uitslag op rendement, dus zonder dit formulier lost TDR-0011 zijn eigen premisse
 * maar half op.
 */
export async function legWijzigingVast(
  campaignId: string | null,
  invoer: WijzigingInvoer,
): Promise<ControlResult> {
  const { supabase, user } = await requireAdmin()

  const body = parseJournalBody('wijziging', invoer)
  if (!body.ok) {
    return { ok: false, probleem: body.problemen.join(' · '), vastgelegd: false, onbekend: false }
  }

  const dubbel = await isDubbel(supabase, campaignId, invoer.wat)
  if (dubbel) {
    return { ok: false, probleem: dubbel, vastgelegd: false, onbekend: false }
  }

  const geschreven = await schrijfJournaal(supabase, campaignId, invoer, undefined, user.id)
  return geschreven
    ? { ok: true, melding: 'Vastgelegd in het journaal.' }
    : {
        ok: false,
        probleem: 'Het journaal weigerde de regel. Probeer het opnieuw.',
        vastgelegd: false,
        onbekend: false,
      }
}

export async function pauzeerOfHervat(
  campaignId: string,
  naar: 'ACTIVE' | 'PAUSED',
  verwachteHuidigeStatus: string,
  invoer: WijzigingInvoer,
): Promise<ControlResult> {
  return voerUit(campaignId, invoer, () =>
    setCampaignStatus(campaignId, naar, verwachteHuidigeStatus),
  )
}

/**
 * @param naarMajor Het bedrag zoals je het typt, dus 20 voor twintig euro.
 *
 * @ai-gotcha: De omrekening naar minor units gebeurt hier, op de server, met de valuta die
 * we bij Meta ophalen. Zou de client een minor-getal sturen, dan bepaalt de browser hoeveel
 * geld er per dag uitgaat en is een factor honderd één aanpassing in de devtools.
 */
export async function zetDagbudget(
  campaignId: string,
  naarMajor: number,
  verwachteHuidigeMinor: number | null,
  invoer: WijzigingInvoer,
): Promise<ControlResult> {
  return voerUit(campaignId, invoer, async () => {
    const valuta = await loadAccountCurrency()
    return setCampaignDailyBudget(
      campaignId,
      naarMinorUnit(naarMajor, valuta),
      verwachteHuidigeMinor,
      valuta,
    )
  })
}

async function voerUit(
  campaignId: string,
  invoer: WijzigingInvoer,
  handeling: () => Promise<WriteUitkomst>,
): Promise<ControlResult> {
  const { supabase, user } = await requireAdmin()

  if (!schrijvenMogelijk()) {
    return {
      ok: false,
      probleem: 'Deze omgeving mag niet schrijven; META_WRITE_TOKEN staat niet gezet.',
      vastgelegd: false,
      onbekend: false,
    }
  }

  const body = parseJournalBody('wijziging', invoer)
  if (!body.ok) {
    return { ok: false, probleem: body.problemen.join(' · '), vastgelegd: false, onbekend: false }
  }

  const dubbel = await isDubbel(supabase, campaignId, invoer.wat)
  if (dubbel) return { ok: false, probleem: dubbel, vastgelegd: false, onbekend: false }

  const uitkomst = await handeling()

  if (!uitkomst.ok) {
    // @ai-why: Bij een onbekende uitkomst gaat er tóch een journaalregel in, met wat we
    // weten. Meta heeft de POST mogelijk wél toegepast, en een lege tijdlijn naast een
    // gewijzigde campagne is het ene geval dat je later niet meer kunt reconstrueren.
    const vastgelegd = uitkomst.onbekend
      ? await schrijfJournaal(supabase, campaignId, invoer, { uitkomst: 'onbekend' }, user.id)
      : false

    return { ok: false, probleem: uitkomst.probleem, vastgelegd, onbekend: uitkomst.onbekend }
  }

  const vastgelegd = await schrijfJournaal(
    supabase,
    campaignId,
    invoer,
    { ...uitkomst.waargenomen },
    user.id,
  )

  return vastgelegd
    ? { ok: true, melding: 'Doorgevoerd en vastgelegd.' }
    : {
        ok: false,
        probleem:
          'Doorgevoerd bij Meta, maar niet vastgelegd in het journaal. Noteer het zelf met het losse formulier, anders mist de tijdlijn deze wijziging.',
        vastgelegd: false,
        onbekend: false,
      }
}

/**
 * @ai-gotcha: Probeert de insert twee keer. Het journaal is de enige plek waar dit verhaal
 * blijft staan en de tabel kent geen UPDATE, dus een correctie achteraf is een nieuwe regel
 * met de hand. Eén herkansing kost niets en scheelt de meeste incidentele mislukkingen.
 */
async function schrijfJournaal(
  supabase: Parameters<typeof appendEvent>[0],
  campaignId: string | null,
  invoer: WijzigingInvoer,
  waargenomen: Record<string, unknown> | undefined,
  createdBy: string,
): Promise<boolean> {
  const regel = {
    kind: 'wijziging' as const,
    campaignId,
    body: waargenomen ? { ...invoer, waargenomen } : invoer,
    createdBy,
  }

  for (let poging = 0; poging < 2; poging += 1) {
    const uitkomst = await appendEvent(supabase, regel)
    if (uitkomst.ok) return true
  }
  return false
}

async function isDubbel(
  supabase: Parameters<typeof readJournal>[0],
  campaignId: string | null,
  wat: string,
): Promise<string | null> {
  const journaal = await readJournal(supabase, 100)

  // @ai-why: Kan het journaal niet gelezen worden, dan gaat de handeling door. Anders
  // blokkeert een leesfout je hele cockpit, en dubbel vastleggen is hier de mildere fout:
  // twee regels zijn leesbaar, een geblokkeerde pauzeerknop bij een doorlopende campagne
  // kost geld.
  if (!journaal.ok) return null

  const grens = Date.now() - ONTDUBBEL_VENSTER_MS
  const recent = journaal.data.find(
    (e: JournalEvent) =>
      e.kind === 'wijziging' &&
      e.campaignId === campaignId &&
      (e.body as { wat?: unknown } | null)?.wat === wat &&
      Date.parse(e.at) >= grens,
  )

  return recent
    ? 'Deze wijziging staat al in het journaal, net. Ververs eerst; twee identieke regels zijn niet meer te verwijderen.'
    : null
}
