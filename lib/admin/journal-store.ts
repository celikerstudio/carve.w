/**
 * De enige poort tussen het journaal en de database.
 *
 * @ai-why: Alle schrijfacties lopen via `appendEvent`, en die valideert vóór de insert.
 * De tabel accepteert jsonb, dus zonder deze poort kan er een regel in belanden waarvan
 * geen enkele lezer de vorm kent. Dat merk je pas maanden later, wanneer een tijdlijn
 * over een halfjaar stilletjes een gat heeft. De database bewaakt alleen wat SQL kan
 * bewaken (de `kind`-check en `afsluiting_verwijst`); de vorm van `body` leeft in zod.
 *
 * @ai-gotcha: Er is geen `updateEvent` en geen `deleteEvent`, en die horen er ook niet te
 * komen. De tabel heeft geen UPDATE- of DELETE-policy, dus zo'n functie zou stil falen op
 * RLS in plaats van een fout te geven. Corrigeren doe je met een nieuwe regel, niet door
 * de oude te herschrijven.
 *
 * @ai-sync: supabase/migrations/20260910000001_create_ads_journal.sql
 * @ai-sync: lib/admin/journal.ts
 * @ai-sync: lib/admin/watch.ts
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { validateEvent, type JournalEvent, type JournalKind } from './journal'

const TABEL = 'ads_journal'

/** Eén rij zoals de database hem teruggeeft. */
export interface JournalRow {
  id: string
  at: string
  kind: JournalKind
  campaign_id: string | null
  body: unknown
  ref: string | null
}

export interface NieuweRegel {
  kind: JournalKind
  campaignId: string | null
  body: unknown
  /** Verplicht bij `afsluiting`, verboden bij de rest. */
  ref?: string | null
  /** Wanneer het gebeurde. Weglaten betekent nu. */
  at?: string
  /**
   * De gebruiker die dit schreef. Weglaten betekent: het systeem deed het.
   *
   * @ai-gotcha: De migratie documenteert `created_by IS NULL` als "geschreven door het
   * systeem". Zolang niets dit veld vult is élke regel machinaal volgens de database, ook
   * die jij zelf typte, en dan is de kolom een leugen in plaats van informatie.
   */
  createdBy?: string | null
}

export type AppendResult = { ok: true } | { ok: false; problemen: string[] }

export type ReadResult =
  | { ok: true; data: JournalEvent[] }
  | { ok: false; problemen: string[] }

export function toJournalEvent(row: JournalRow): JournalEvent {
  return {
    id: row.id,
    at: row.at,
    kind: row.kind,
    campaignId: row.campaign_id,
    body: row.body,
    ref: row.ref,
  }
}

/**
 * @ai-why: Valideert met een verzonnen `id` en `at`, omdat de database die zelf zet. Wat
 * hier getoetst wordt is de vorm van `body` en de `ref`-regel, en die hangen geen van
 * beide van die twee velden af.
 */
export async function appendEvent(
  client: SupabaseClient,
  regel: NieuweRegel,
): Promise<AppendResult> {
  const controle = validateEvent({
    id: 'nieuw',
    at: regel.at ?? new Date().toISOString(),
    kind: regel.kind,
    campaignId: regel.campaignId,
    body: regel.body,
    ref: regel.ref ?? null,
  })

  if (!controle.ok) return controle

  const { error } = await client.from(TABEL).insert({
    kind: regel.kind,
    campaign_id: regel.campaignId,
    body: controle.body,
    ref: regel.ref ?? null,
    created_by: regel.createdBy ?? null,
    ...(regel.at ? { at: regel.at } : {}),
  })

  // @ai-gotcha: RLS geeft hier een fout en geen lege insert. Komt er een melding over een
  // policy, dan is de sessie geen admin (public.is_admin()), niet dat de tabel ontbreekt.
  if (error) return { ok: false, problemen: [error.message] }

  return { ok: true }
}

/**
 * Het journaal, nieuwste eerst.
 *
 * @ai-why: Geeft een resultaat terug en geen kale lijst, in de vorm van
 * lib/admin/sources/source.ts. Dit gaf eerst `[]` bij een fout, en dat is hier
 * onherstelbaar duur: buildWatchRun leest een leeg journaal als "er is nog nooit iets
 * vastgelegd", schrijft de controle opnieuw weg en herhaalt elk openstaand voorstel. De
 * tabel heeft geen DELETE-policy, dus één mislukte lees zet permanent rommel in de
 * tijdlijn die het hele ontwerp moest beschermen. Stilte is hier geen veilige uitkomst.
 *
 * @ai-gotcha: `openTests` en `laatsteControle` in lib/admin/watch.ts sorteren zelf op
 * `at` en leunen niet op deze volgorde. Verander je hier de sortering, dan blijft dat dus
 * goed gaan; laat je die sortering daar weg, dan niet.
 */
export async function readJournal(client: SupabaseClient, limiet = 500): Promise<ReadResult> {
  const { data, error } = await client
    .from(TABEL)
    .select('id, at, kind, campaign_id, body, ref')
    .order('at', { ascending: false })
    // @ai-why: `id` als tweede sleutel. Twee regels met dezelfde `at` (een ronde die in
    // één keer meerdere voorstellen wegschrijft) kwamen anders in willekeurige volgorde
    // terug, en dan verschilt de tijdlijn per aanroep zonder dat er iets veranderd is.
    .order('id', { ascending: false })
    .limit(limiet)

  if (error) return { ok: false, problemen: [error.message] }
  if (!data) return { ok: false, problemen: ['geen antwoord van de database'] }

  return { ok: true, data: (data as JournalRow[]).map(toJournalEvent) }
}
