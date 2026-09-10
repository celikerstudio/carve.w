'use server'

import { buildAds } from '@/lib/admin/ads'
import { requireAdmin } from '@/lib/admin/auth'
import { appendEvent, readJournal } from '@/lib/admin/journal-store'
import { fetchSource, type SourceFailure } from '@/lib/admin/sources/source'
import { ga4Missing, loadGa4, loadGa4Campaigns } from '@/lib/admin/sources/ga4'
import { loadMetaCampaigns, metaMissing } from '@/lib/admin/sources/meta'
import { buildWatchRun, type WatchRun } from '@/lib/admin/watch'

/**
 * De ronde uit lib/admin/watch.ts, gevoed met echte bronnen.
 *
 * @ai-why: Twee aparte acties, en dat is de belangrijkste keuze in dit bestand. `fetchWatch`
 * leest en beoordeelt; `recordWatch` schrijft. Zou het renderen zelf wegschrijven, dan zet
 * elke keer dat je de Ads-tab opent een regel in een tabel zonder DELETE-policy, en dan
 * groeit het journaal met je paginabezoeken in plaats van met wat er gebeurde. Een GET
 * hoort niets blijvends te doen.
 *
 * @ai-gotcha: De vorige periode komt bij Meta uit een verschoven `now` en bij GA4 uit een
 * offset in dagen. Twee verschillende mechanismen voor hetzelfde venster, want Meta neemt
 * absolute datums en GA4 alleen relatieve. Lopen die uit de pas, dan vergelijkt
 * lib/admin/observe.ts twee ongelijke periodes en ziet elk verschil eruit als een trend.
 *
 * @ai-sync: lib/admin/watch.ts
 * @ai-sync: lib/admin/journal-store.ts
 * @ai-sync: components/admin/chat/AdminAdsPane.tsx
 */

const DAG_IN_MS = 24 * 60 * 60 * 1000

function kalenderdag(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export interface WatchResult {
  days: number
  /** Null als Meta niets gaf; dan valt er niets te beoordelen. */
  run: WatchRun | null
  /** Bronnen die niets gaven, voor de melding onder het blok. */
  failures: SourceFailure[]
  /**
   * Waarom er niets vastgelegd kan worden, of null als dat wel kan.
   *
   * @ai-why: Apart van `failures`, want dit is de enige die het opslaan blokkeert. Een
   * kapotte GA4 laat de kosten staan; een onleesbaar journaal maakt elke schrijfactie
   * gevaarlijk, omdat we dan niet weten wat er al vastligt.
   */
  opslagGeblokkeerd: string | null
}

export async function fetchWatch(days: number): Promise<WatchResult> {
  const { supabase } = await requireAdmin()
  const nu = new Date()
  const vorigeNu = new Date(nu.getTime() - days * DAG_IN_MS)

  const [metaNu, metaVorig, ga4Nu, ga4Vorig, ga4Totalen, journaal] = await Promise.all([
    fetchSource('meta', (s) => loadMetaCampaigns(days, s, nu), { missing: metaMissing() }),
    fetchSource('meta', (s) => loadMetaCampaigns(days, s, vorigeNu), { missing: metaMissing() }),
    fetchSource('ga4', () => loadGa4Campaigns(days), { missing: ga4Missing() }),
    fetchSource('ga4', () => loadGa4Campaigns(days, days), { missing: ga4Missing() }),
    fetchSource('ga4', () => loadGa4(days), { missing: ga4Missing() }),
    readJournal(supabase),
  ])

  const failures = [metaNu, metaVorig, ga4Nu, ga4Vorig, ga4Totalen].flatMap((r) =>
    r.ok ? [] : [r.failure],
  )

  if (!metaNu.ok) {
    return {
      days,
      run: null,
      failures,
      opslagGeblokkeerd: 'Meta gaf geen campagnes, dus er valt niets te beoordelen.',
    }
  }

  // @ai-why: GA4-uitval geeft een lege campagnelijst en niet een afgebroken ronde. buildAds
  // labelt die campagnes dan `geen-gegevens`, en zowel lib/admin/observe.ts als
  // lib/admin/proposals.ts weigeren op zo'n rij een oordeel te vellen. De kosten blijven
  // wél zichtbaar. Dat is dezelfde afweging als in app/actions/admin/ads.ts.
  const huidig = buildAds(metaNu.data, ga4Nu.ok ? ga4Nu.data : []).rows
  const vorig = metaVorig.ok ? buildAds(metaVorig.data, ga4Vorig.ok ? ga4Vorig.data : []).rows : []

  const run = buildWatchRun({
    campaigns: metaNu.data,
    ga4Rows: ga4Nu.ok ? ga4Nu.data : [],
    huidig,
    vorig,
    bezoekersTotaal: ga4Totalen.ok ? ga4Totalen.data.visitors : 0,
    appStoreClicksTotaal: ga4Totalen.ok ? ga4Totalen.data.appStoreClicks : 0,
    journaal: journaal.ok ? journaal.data : null,
    venster: { van: kalenderdag(new Date(nu.getTime() - days * DAG_IN_MS)), tot: kalenderdag(nu) },
    vandaag: kalenderdag(nu),
  })

  return {
    days,
    run,
    failures,
    opslagGeblokkeerd: journaal.ok
      ? null
      : `Het journaal is niet te lezen (${journaal.problemen.join(', ')}), dus er wordt niets vastgelegd.`,
  }
}

export interface RecordResult {
  vastgelegd: number
  problemen: string[]
}

/**
 * Legt vast wat de ronde vond. Alleen op expliciet verzoek.
 *
 * @ai-gotcha: Draait de ronde opnieuw in plaats van gebeurtenissen uit de client aan te
 * nemen. Anders bepaalt de browser wat er in het journaal komt, en dat is een tabel die
 * niemand meer kan opschonen. De ontdubbeling in buildWatchRun vangt op dat de tweede
 * ronde dezelfde uitkomst heeft.
 */
export async function recordWatch(days: number): Promise<RecordResult> {
  const { supabase } = await requireAdmin()
  const { run, opslagGeblokkeerd } = await fetchWatch(days)

  if (opslagGeblokkeerd) return { vastgelegd: 0, problemen: [opslagGeblokkeerd] }
  if (!run || !run.journaalGelezen) {
    return { vastgelegd: 0, problemen: ['De ronde leverde niets op om vast te leggen.'] }
  }

  const problemen: string[] = []
  let vastgelegd = 0

  // @ai-why: Eén voor één en niet in bulk. Weigert het journaal er één (een body die niet
  // door zod komt), dan horen de andere gewoon door te gaan; het zijn losse constateringen
  // en geen transactie. De melding zegt welke het was.
  for (const event of run.events) {
    const uitkomst = await appendEvent(supabase, event)
    if (uitkomst.ok) vastgelegd += 1
    else problemen.push(`${event.kind}: ${uitkomst.problemen.join(', ')}`)
  }

  return { vastgelegd, problemen }
}
